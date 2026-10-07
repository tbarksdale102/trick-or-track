// Read-only checks: explicit Jira hierarchy is evidence; generic links are not equivalence.
export function reconcile(issues, previous=[]) {
 const byKey=new Map(issues.map(i=>[i.key,i])), findings=[], mappings=[];
 for(const issue of issues){
  if(issue.type.toLowerCase()==='epic'){
   const parent=byKey.get(issue.parent);
   if(!issue.parent)findings.push({key:issue.key,reason:'Epic has no parent Initiative'});
   else if(!parent)findings.push({key:issue.key,reason:'Parent is outside the imported scope or inaccessible; mapping needs review'});
   else if(parent.type.toLowerCase()!=='initiative')findings.push({key:issue.key,reason:`Parent ${parent.key} is ${parent.type}, not Initiative`});
   else mappings.push({epic:issue.key,initiative:parent.key,evidence:'Jira parent field'});
  }
  if(issue.type.toLowerCase()==='requirement')findings.push({key:issue.key,reason:'Requirement-to-RPM and equivalent Initiative mapping needs explicit configuration'});
 }
 const old=new Map(previous.map(i=>[i.id,i]));
 return {checkedAt:new Date().toISOString(),findings,mappings,added:issues.filter(i=>!old.has(i.id)).length,updated:issues.filter(i=>old.has(i.id)&&JSON.stringify(i)!==JSON.stringify(old.get(i.id))).length,noLongerVisible:previous.filter(i=>!byKey.has(i.key)).map(i=>i.key),mode:'Read-only; no Jira issues changed'};
}
