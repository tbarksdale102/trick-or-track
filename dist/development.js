const clean=v=>String(v??'').trim();
const lines=v=>clean(v).split(/\r?\n/).map(clean).filter(Boolean);
export function readiness(state,r){
 const d=r.development||{};
 return [
 ['Source and revision',!!clean(r.source)&&!!clean(r.text)&&!!clean(r.revision)],
 ['Requirement and Initiative links',!!r.req&&!!r.initiative],
 ['Delivery owner',!!clean(d.owner)],
 ['Acceptance criteria',Array.isArray(d.criteria)&&d.criteria.length>0&&d.criteria.every(x=>!!clean(x))],
 ['System context',state.systems.some(s=>s.id===r.system)],
 ['Implementation scope',!!clean(d.scope)]
 ].map(([label,complete])=>({label,complete}));
}
export function updateDevelopment(state,id,input){
 const r=state.rpms.find(r=>r.id===id);if(!r)throw Error('Unknown requirement.');
 const d={owner:clean(input.owner),criteria:lines(input.criteria),scope:clean(input.scope),constraints:clean(input.constraints),files:lines(input.files)};
 if(d.owner.length>200||d.scope.length>4000||d.constraints.length>4000||d.criteria.length>30||d.criteria.some(c=>c.length>1000)||d.files.length>50)throw Error('Implementation details exceed supported limits.');
 if(d.files.some(p=>p.length>250||!/^[a-zA-Z0-9_.\/-]+$/.test(p)||p.startsWith('/')||p.split('/').some(x=>x==='..'||x==='.'||!x)||p.split('/').some(x=>['.runtime','.env','.git'].includes(x))))throw Error('Use relative repository file paths without parent traversal or private runtime paths.');
 const system=clean(input.system);if(system&&!state.systems.some(s=>s.id===system))throw Error('Select a registered system.');
 r.development=d;r.system=system||null;
 state.history.unshift({at:new Date().toISOString(),text:'Updated implementation plan: '+r.id});return r;
}
export function taskPackage(state,id){
 const r=state.rpms.find(r=>r.id===id);if(!r)throw Error('Unknown requirement.');
 const missing=readiness(state,r).filter(c=>!c.complete);if(missing.length)throw Error('Complete readiness items: '+missing.map(c=>c.label).join(', '));
 const d=r.development,s=state.systems.find(s=>s.id===r.system);
 const slug=(r.id+'-r'+r.revision).toLowerCase().replace(/[^a-z0-9-]/g,'-').replace(/-+/g,'-').slice(0,100);
 const dir='.trellis/tasks/'+slug;
 const prd=`# ${r.title}\n\n## Source requirement\n- RPM: ${r.id}\n- Revision: ${r.revision}\n- Source: ${r.source}\n- Requirement: ${r.req}\n- Initiative: ${r.initiative}\n- Delivery owner: ${d.owner}\n\n${r.text}\n\n## Implementation scope\n${d.scope}\n\n## Acceptance criteria\n${d.criteria.map(c=>'- [ ] '+c).join('\n')}\n\n## Constraints\n${d.constraints||'No additional constraints recorded.'}\n\n## System context\n${s.name} (${s.repo}, sample revision ${s.commit})\n\n## Relevant files\n${d.files.map(f=>'- '+f).join('\n')||'Identify implementation files during planning.'}\n\n## Verification\nRun relevant tests and review each acceptance criterion. Task completion does not establish requirement verification or change Jira status.\n`;
 const context={rpmId:r.id,revision:r.revision,requirement:r.req,initiative:r.initiative,system:s.id,owner:d.owner,source:r.source,relevantFiles:d.files,dataOrigin:'local sample workspace'};
 const manifest=JSON.stringify({file:dir+'/prd.md',reason:'Reviewed requirement, acceptance criteria and implementation scope'})+'\n'+JSON.stringify({file:'.trellis/spec/product/requirements.md',reason:'Product invariants'})+'\n';
 const task={id:slug,name:slug,title:r.title,description:d.scope,status:'planning',dev_type:'fullstack',scope:null,package:null,priority:'P2',creator:'trick-or-track',assignee:null,createdAt:new Date().toISOString().slice(0,10),completedAt:null,branch:null,base_branch:null,worktree_path:null,commit:null,pr_url:null,subtasks:[],children:[],parent:null,relatedFiles:d.files,notes:'Exported local sample requirement; assign a Trellis developer before implementation.',meta:{traceability:context}};
 return {slug,files:{[dir+'/task.json']:JSON.stringify(task,null,2),[dir+'/prd.md']:prd,[dir+'/traceability.json']:JSON.stringify(context,null,2),[dir+'/implement.jsonl']:manifest,[dir+'/check.jsonl']:manifest,'IMPORT-INSTRUCTIONS.txt':`Extract into a Trick or Track checkout with Trellis configured. Do not overwrite an existing task directory. Review the PRD and assign a developer before starting.\nFrom the repository root:\npython3 .trellis/scripts/task.py validate ${slug}\npython3 .trellis/scripts/task.py start ${slug}\nThe export does not execute agents, write Jira issues, or certify the requirement. Never include secrets in task content.\n`}};
}
// ZIP storage mode: UTF-8 filenames and CRC32, with no runtime dependency.
export function zipPackage(files){
 const enc=new TextEncoder(),parts=[],central=[];let offset=0;
 const crc=data=>{let c=0xffffffff;for(const b of data){c^=b;for(let i=0;i<8;i++)c=(c>>>1)^((c&1)?0xedb88320:0);}return (c^0xffffffff)>>>0;};
 const header=(size)=>{const b=new Uint8Array(size);return [b,new DataView(b.buffer)];};
 for(const [name,text] of Object.entries(files)){
  const n=enc.encode(name),data=enc.encode(text),sum=crc(data),[h,v]=header(30);
  v.setUint32(0,0x04034b50,true);v.setUint16(4,20,true);v.setUint16(6,0x800,true);v.setUint16(12,33,true);v.setUint32(14,sum,true);v.setUint32(18,data.length,true);v.setUint32(22,data.length,true);v.setUint16(26,n.length,true);
  parts.push(h,n,data);const [ch,cv]=header(46);cv.setUint32(0,0x02014b50,true);cv.setUint16(4,20,true);cv.setUint16(6,20,true);cv.setUint16(8,0x800,true);cv.setUint16(14,33,true);cv.setUint32(16,sum,true);cv.setUint32(20,data.length,true);cv.setUint32(24,data.length,true);cv.setUint16(28,n.length,true);cv.setUint32(42,offset,true);central.push(ch,n);offset+=h.length+n.length+data.length;
 }
 const length=central.reduce((n,b)=>n+b.length,0),[end,ev]=header(22);ev.setUint32(0,0x06054b50,true);ev.setUint16(8,Object.keys(files).length,true);ev.setUint16(10,Object.keys(files).length,true);ev.setUint32(12,length,true);ev.setUint32(16,offset,true);
 return new Blob([...parts,...central,end],{type:'application/zip'});
}
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function developmentPanel(state,r){
 const checks=readiness(state,r),ready=checks.every(c=>c.complete),d=r.development||{};
 return `<section class="panel development-panel"><div class="panel-head"><div><h2>Implementation readiness</h2><p>Prepare a reviewed task for Trellis.</p></div><span class="pill ${ready?'':'warn'}">${checks.filter(c=>c.complete).length} / ${checks.length} ready</span></div><div class="development-grid"><div><h3>Readiness checklist</h3><ul class="readiness-list">${checks.map(c=>`<li><span class="${c.complete?'ready':'missing'}">${c.complete?'✓':'○'}</span> ${esc(c.label)}</li>`).join('')}</ul><p class="muted">Readiness is planning completeness. It does not verify the requirement or change Jira status.</p></div><form id="development-form" data-rpm-id="${esc(r.id)}"><label class="field">Delivery owner<input name="owner" maxlength="200" value="${esc(d.owner)}" placeholder="Team or responsible person"></label><label class="field">Acceptance criteria · one per line<textarea name="criteria" rows="4" maxlength="30000" placeholder="Use measurable, testable outcomes">${esc((d.criteria||[]).join('\n'))}</textarea></label><label class="field">Implementation scope<textarea name="scope" maxlength="4000" rows="3" placeholder="What should change, and what is outside scope?">${esc(d.scope)}</textarea></label><label class="field">Associated system<select name="system"><option value="">Select a system</option>${state.systems.map(s=>`<option value="${esc(s.id)}" ${r.system===s.id?'selected':''}>${esc(s.name)}</option>`).join('')}</select></label><details><summary>Constraints and relevant files</summary><label class="field">Constraints<textarea name="constraints" maxlength="4000">${esc(d.constraints)}</textarea></label><label class="field">Repository paths · one per line<textarea name="files" maxlength="12500" placeholder="dist/domain.js">${esc((d.files||[]).join('\n'))}</textarea></label></details><p class="muted">Local sample planning only. Do not enter credentials or sensitive customer data.</p><p id="development-error" class="error" role="alert"></p><div class="actions"><button type="submit">Save implementation plan</button><button type="button" id="review-trellis" class="primary" ${ready?'':'disabled'}>Review Trellis export</button></div><small>Save changes before reviewing the export.</small></form></div></section>`;
}
export function mountDevelopment(state,save,refresh,notify){
 const form=document.querySelector('#development-form');if(!form)return;
 form.addEventListener('submit',e=>{e.preventDefault();e.stopPropagation();try{updateDevelopment(state,form.dataset.rpmId,Object.fromEntries(new FormData(form)));save();refresh();notify('Implementation plan saved locally.');}catch(err){document.querySelector('#development-error').textContent=err.message;}});
 form.addEventListener('input',()=>{document.querySelector('#review-trellis').disabled=true;});
 document.querySelector('#review-trellis').onclick=()=>{
  try{const pkg=taskPackage(state,form.dataset.rpmId),modal=document.querySelector('#modal');modal.innerHTML=`<h2>Review Trellis task export</h2><p>Task: <strong>${esc(pkg.slug)}</strong></p><p>Review the requirement, source, scope, and criteria before downloading.</p><pre class="export-preview">${esc(Object.values(pkg.files)[1])}</pre><p class="muted">Downloads a ZIP for your configured Trick or Track repository. No Jira writes or agents are started. Do not overwrite an existing task with the same identifier.</p><div class="dialog-actions"><button type="button" data-action="close">Cancel</button><button type="button" id="download-trellis" class="primary">Download task ZIP</button></div>`;modal.showModal();
  document.querySelector('#download-trellis').onclick=()=>{const url=URL.createObjectURL(zipPackage(pkg.files)),a=document.createElement('a');a.href=url;a.download=pkg.slug+'-trellis.zip';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);state.history.unshift({at:new Date().toISOString(),text:'Exported Trellis task: '+pkg.slug+' from '+form.dataset.rpmId});save();modal.close();refresh();notify('Trellis task exported. Requirement verification is unchanged.');};
  }catch(err){document.querySelector('#development-error').textContent=err.message;}
 };
}
