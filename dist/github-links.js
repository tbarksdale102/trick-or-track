export function linkGithubEvidence(state,rpmId,repository,item){
 const r=state.rpms.find(r=>r.id===rpmId);if(!r)throw Error('Select a valid requirement.');
 if(!repository||!Number.isSafeInteger(repository.id)||!['issue','pull','commit','file'].includes(item?.kind)||typeof item.id!=='string'||typeof item.title!=='string')throw Error('Invalid GitHub reference.');
 const base='https://github.com/'+repository.owner+'/'+repository.name;
 let url;
 if(item.kind==='issue'||item.kind==='pull'){if(!Number.isSafeInteger(item.number)||item.number<1)throw Error('Invalid GitHub issue number.');url=base+(item.kind==='pull'?'/pull/':'/issues/')+item.number;}
 else if(item.kind==='commit'){if(!/^[a-f0-9]{40}$/i.test(item.id))throw Error('Invalid commit.');url=base+'/commit/'+item.id;}
 else {const u=new URL(item.url);if(u.origin!=='https://github.com'||!u.href.startsWith(base+'/blob/'))throw Error('Invalid file reference.');url=u.href;}
 const key=repository.id+':'+item.kind+':'+item.id+(item.path?':'+item.path:'');r.github ||= [];if(r.github.some(x=>x.key===key))return false;
 r.github.push({key,repositoryId:repository.id,repository:repository.owner+'/'+repository.name,kind:item.kind,id:item.id,title:item.title,url});
 state.history.unshift({at:new Date().toISOString(),text:'Linked GitHub '+item.kind+' to '+r.id+': '+item.title});return true;
}
export function unlinkGithubEvidence(state,rpmId,key){const r=state.rpms.find(r=>r.id===rpmId);if(!r)throw Error('Unknown requirement.');const before=r.github?.length||0;r.github=(r.github||[]).filter(x=>x.key!==key);if(r.github.length===before)return false;state.history.unshift({at:new Date().toISOString(),text:'Removed GitHub reference from '+r.id});return true;}
