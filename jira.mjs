export function connection(input) {
  if (!['cloud','dc'].includes(input.kind)) throw Error('Select Jira Cloud or Data Center.');
  let url; try { url = new URL(input.url); } catch { throw Error('Enter a valid Jira HTTPS URL.'); }
  if(url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) throw Error('Use an HTTPS base URL without credentials, query, or fragment.');
  if(input.kind==='cloud' && (!url.hostname.endsWith('.atlassian.net') || url.pathname !== '/')) throw Error('Cloud site must look like https://your-team.atlassian.net.');
  if(typeof input.token!=='string'||!input.token.trim()) throw Error('Enter a token.');
  if(input.kind==='cloud' && (typeof input.email!=='string'||!input.email.includes('@'))) throw Error('Enter your Atlassian account email.');
  const site=url.href.replace(/\/$/,'');
  let base=site;
  if(input.kind==='cloud' && input.cloudId){if(!/^[a-zA-Z0-9-]{1,100}$/.test(input.cloudId))throw Error('Invalid Cloud ID.');base='https://api.atlassian.com/ex/jira/'+input.cloudId;}
  return {site,base,auth:input.kind==='cloud'?'Basic '+Buffer.from(input.email+':'+input.token).toString('base64'):'Bearer '+input.token};
}
export function query(input){
  if(input.scope==='all')return 'created IS NOT EMPTY ORDER BY id ASC';
  if(input.scope!=='project'||! /^[A-Za-z][A-Za-z0-9_]*$/.test(input.project||''))throw Error('Enter a valid project key, or choose all accessible projects.');
  return `project = "${input.project}" ORDER BY id ASC`;
}
export async function page(input,request=fetch){
  const c=connection(input),jql=query(input);
  const body={jql,maxResults:100,fields:['summary','description','issuetype','status','project','parent','issuelinks','updated','labels','assignee',...(input.parentField?[input.parentField]:[])]};
  if(input.parentField && !/^customfield_\d+$/.test(input.parentField))throw Error('Parent field must be a customfield_ identifier.');
  if(input.kind==='cloud'){if(input.cursor){if(typeof input.cursor!=='string'||input.cursor.length>10000)throw Error('Invalid page token.');body.nextPageToken=input.cursor;}}
  else {body.startAt=input.cursor??0;if(!Number.isSafeInteger(body.startAt)||body.startAt<0)throw Error('Invalid page offset.');}
  let res;try{res=await request(c.base+(input.kind==='cloud'?'/rest/api/3/search/jql':'/rest/api/2/search'),{method:'POST',headers:{Authorization:c.auth,Accept:'application/json','Content-Type':'application/json'},body:JSON.stringify(body),redirect:'error',signal:AbortSignal.timeout(45000)});}catch{throw Error('Cannot reach Jira. Check the URL, VPN/network access, and certificate trust.');}
  if(!res.ok){const e=new Error(({401:'Jira rejected the credentials. Check your email and token.',403:'Jira denied access. Check account permissions and token scopes.',400:'Jira rejected the search. Check the project key and parent field.',404:'Jira endpoint not found. Check deployment type, base URL, and Cloud ID.',429:'Jira rate limit reached. Wait and retry; the previous import is unchanged.'})[res.status]||`Jira returned HTTP ${res.status}. Previous import is unchanged.`);e.status=res.status===429?429:502;throw e;}
  let data;try{data=await res.json();}catch{throw Error('Jira returned an invalid response. Check that this is the API base URL.');}
  if(!Array.isArray(data.issues))throw Error('Jira response did not contain issues.');
  let cursor=null;
  if(input.kind==='cloud'){if(data.isLast!==true&&data.nextPageToken)cursor=data.nextPageToken;else if(data.isLast===false)throw Error('Jira omitted the next page token. Import was not completed.');}
  else{if(!Number.isSafeInteger(data.total))throw Error('Jira omitted the result total.');const next=body.startAt+data.issues.length;if(next<data.total){if(!data.issues.length)throw Error('Jira returned an empty page before completion.');cursor=next;}}
  return {site:c.site,issues:data.issues.map(i=>({id:String(i.id),key:i.key,summary:i.fields?.summary||'',description:i.fields?.description||'',type:i.fields?.issuetype?.name||'Unknown',status:i.fields?.status?.name||'Unknown',project:i.fields?.project?.key||'',parent:i.fields?.parent?.key||i.fields?.[input.parentField]?.key||i.fields?.[input.parentField]||null,links:(i.fields?.issuelinks||[]).map(l=>({type:l.type?.name,direction:l.outwardIssue?'outward':'inward',key:(l.outwardIssue||l.inwardIssue)?.key})),updated:i.fields?.updated,assignee:i.fields?.assignee?.displayName||'Unassigned',labels:i.fields?.labels||[]})),cursor};
}
