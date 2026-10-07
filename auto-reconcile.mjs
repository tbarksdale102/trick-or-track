import {connection} from './jira.mjs';
export function validateRules(r){if(!r?.enabled)return;for(const k of ['requirementType','initiativeType','epicType','equivalenceLink','epicLink','project'])if(typeof r[k]!=='string'||!r[k].trim())throw Error('Complete all automatic reconciliation rule fields.');if(!/^[A-Za-z][A-Za-z0-9_]*$/.test(r.project))throw Error('Invalid creation project key.');if(new Set([r.requirementType,r.initiativeType,r.epicType].map(x=>x.toLowerCase())).size!==3)throw Error('Requirement, Initiative, and Epic types must differ.');}
export async function jiraRequest(config,path,body,method='POST'){
 const c=connection(config);let r;try{r=await fetch(c.base+'/rest/api/'+(config.kind==='cloud'?'3':'2')+path,{method,headers:{Authorization:c.auth,Accept:'application/json','Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{}),redirect:'error',signal:AbortSignal.timeout(45000)});}catch{throw Error('Jira operation outcome is uncertain; review the action log before retrying.');}
 if(!r.ok)throw Error(`Jira operation returned HTTP ${r.status}. Review project permissions and required fields.`);if(r.status===204||r.headers.get('content-length')==='0')return {};const text=await r.text();return text?JSON.parse(text):{};
}
export async function autoReconcile(config,issues,ledger,persist,request=jiraRequest){
 const r=config.rules;if(!r?.enabled)return {actions:[],review:[]};validateRules(r);
 const actions=[],review=[],byKey=new Map(issues.map(i=>[i.key,i]));
 const isType=(i,t)=>i?.type?.toLowerCase()===t.toLowerCase();
 // User-selected equivalence direction: Initiative outward -> Requirement.
 for(const req of issues.filter(i=>isType(i,r.requirementType))){
  const existing=issues.filter(i=>isType(i,r.initiativeType)&&i.links.some(l=>l.type===r.equivalenceLink&&l.direction==='outward'&&l.key===req.key));
  if(existing.length>1){review.push({key:req.key,reason:'Multiple equivalent Initiatives; no automatic change.'});continue;}if(existing.length===1)continue;
  const id=`${connection(config).site}:initiative:${req.id}`,marker='traceworks-req-'+req.id;let op=ledger[id];
  // Marker is placed during creation so successful creations can be recovered after link failures.
  const candidates=issues.filter(i=>isType(i,r.initiativeType)&&i.labels?.includes(marker));
  if(candidates.length>1){review.push({key:req.key,reason:'Multiple automation markers; manual duplicate review required.'});continue;}
  if(candidates.length===1){op=ledger[id]={state:'created',key:candidates[0].key};await persist(ledger);}
  if(op?.state==='creating'||op?.state==='uncertain'){review.push({key:req.key,reason:'Previous creation outcome is uncertain. Inspect Jira and the saved action log; creation was not retried.'});continue;}
  if(op?.state==='linked'){review.push({key:req.key,reason:'Previously confirmed equivalence is no longer visible. Review scope or changed links.'});continue;}
  try{
   if(!op?.key){const current=await request(config,'/issue/'+encodeURIComponent(req.key)+'?fields=issuelinks',null,'GET');if(current.fields?.issuelinks?.some(l=>l.type?.name===r.equivalenceLink)){review.push({key:req.key,reason:'An equivalence link already exists in Jira; review its target before creating anything.'});continue;}ledger[id]={state:'creating',at:new Date().toISOString(),requirement:req.key};await persist(ledger);
    let created;try{created=await request(config,'/issue',{fields:{project:{key:r.project},issuetype:{name:r.initiativeType},summary:req.summary,labels:[marker]}});}catch(e){ledger[id].state='uncertain';ledger[id].error=e.message;await persist(ledger);throw e;}
    if(!created.key)throw Error('Jira did not return a created issue key.');op=ledger[id]={state:'created',key:created.key,requirement:req.key,at:new Date().toISOString()};await persist(ledger);actions.push({key:created.key,reason:`Created Initiative for ${req.key}`});
   }
   // Jira outwardIssue is the target; inwardIssue is the source of the outward description.
   await request(config,'/issueLink',{type:{name:r.equivalenceLink},inwardIssue:{key:op.key},outwardIssue:{key:req.key}});
   op.state='linked';await persist(ledger);actions.push({key:op.key,reason:`Linked equivalent Initiative to ${req.key}`});
  }catch(e){review.push({key:req.key,reason:e.message});}
 }
 for(const epic of issues.filter(i=>isType(i,r.epicType)&&!i.parent)){
  const targets=[...new Set(epic.links.filter(l=>l.type===r.epicLink&&l.direction==='outward'&&isType(byKey.get(l.key),r.initiativeType)).map(l=>l.key))];
  if(targets.length!==1){review.push({key:epic.key,reason:targets.length?'Multiple candidate parent Initiatives.':'No explicit candidate parent link; assignment requires review.'});continue;}
  const target=targets[0],id=`${connection(config).site}:parent:${epic.id}:${target}`;
  try{const current=await request(config,'/issue/'+encodeURIComponent(epic.key)+'?fields=parent'+(config.parentField?','+config.parentField:''),null,'GET');if(current.fields?.parent||current.fields?.[config.parentField]){review.push({key:epic.key,reason:'Epic already has a parent in Jira; refresh before changing it.'});continue;}await request(config,'/issue/'+encodeURIComponent(epic.key),{fields:config.parentField?{[config.parentField]:target}:{parent:{key:target}}},'PUT');ledger[id]={state:'linked',key:epic.key,parent:target,at:new Date().toISOString()};await persist(ledger);actions.push({key:epic.key,reason:`Assigned to Initiative ${target}`});}catch(e){review.push({key:epic.key,reason:e.message});}
 }
 return {actions,review};
}
