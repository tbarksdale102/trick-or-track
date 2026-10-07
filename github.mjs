const kinds=new Set(['issues','pulls','commits','files']);
export function githubConnection(input){
 const owner=String(input.owner||'').trim(),repo=String(input.repo||'').trim();
 if(!/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/.test(owner)||!/^[A-Za-z0-9_.-]{1,100}$/.test(repo)||['.','..'].includes(repo))throw Error('Enter a valid GitHub owner and repository name.');
 const token=input.token??'';if(typeof token!=='string'||token.length>1000||/[\r\n]/.test(token))throw Error('Invalid GitHub token.');
 return {owner,repo,token:token.trim(),base:'https://api.github.com/repos/'+owner+'/'+repo,url:'https://github.com/'+owner+'/'+repo};
}
export async function githubRequest(c,path,request=fetch){
 let res;try{res=await request(c.base+path,{headers:{Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28',...(c.token?{Authorization:'Bearer '+c.token}:{})},redirect:'error',signal:AbortSignal.timeout(30000)});}catch{throw Error('Cannot reach GitHub. Check network access and certificate trust.');}
 if(!res.ok){const rate=res.status===429||(res.status===403&&res.headers?.get('x-ratelimit-remaining')==='0');throw Error(rate?'GitHub rate limit reached. Wait before importing again.':({401:'GitHub rejected the token.',403:'GitHub denied access. Check token permissions.',404:'Repository not found or access denied. Check owner, name, and private-repository access.'}[res.status]||'GitHub request failed (HTTP '+res.status+').'));}
 try{return {data:await res.json(),link:res.headers?.get('link')||''};}catch{throw Error('GitHub returned invalid JSON.');}
}
export async function githubPage(input,request=fetch){
 const c=githubConnection(input),kind=input.kind??'repository';
 if(kind==='repository'){const {data:d}=await githubRequest(c,'',request);if(!d||!Number.isSafeInteger(d.id)||typeof d.default_branch!=='string')throw Error('Invalid GitHub repository response.');return {repository:{id:d.id,owner:c.owner,name:c.repo,url:c.url,description:typeof d.description==='string'?d.description:'',defaultBranch:d.default_branch,private:!!d.private},items:[],nextPage:null};}
 if(!kinds.has(kind))throw Error('Select issues, pull requests, commits, or files.');
 const page=input.page??1;if(!Number.isSafeInteger(page)||page<1||page>1000)throw Error('Invalid GitHub page.');
 let path;
 if(kind==='files'){
  const tree=await githubRequest(c,'/git/trees/'+encodeURIComponent(String(input.branch||'HEAD'))+'?recursive=1',request);
  if(!Array.isArray(tree.data?.tree))throw Error('Invalid repository file response.');
  return {items:tree.data.tree.filter(x=>x.type==='blob'&&typeof x.path==='string').map(x=>({id:x.sha,kind:'file',title:x.path,path:x.path,url:c.url+'/blob/'+encodeURIComponent(input.branch||'HEAD')+'/'+x.path.split('/').map(encodeURIComponent).join('/')})),nextPage:null,truncated:!!tree.data.truncated};
 }
 path=kind==='commits'?'/commits?per_page=100&page='+page:'/'+kind+'?state=all&per_page=100&page='+page;
 const {data,link}=await githubRequest(c,path,request);if(!Array.isArray(data))throw Error('Invalid GitHub list response.');
 const items=data.filter(x=>kind!=='issues'||!x.pull_request).map(x=>{
  if(kind==='commits'){if(!/^[a-f0-9]{40}$/i.test(x.sha)||typeof x.commit?.message!=='string')throw Error('Invalid GitHub commit response.');return {id:x.sha,kind:'commit',title:x.commit.message.split('\n')[0],url:c.url+'/commit/'+x.sha,at:x.commit.author?.date||null};}
  if(!Number.isSafeInteger(x.number)||x.number<1||typeof x.title!=='string')throw Error('Invalid GitHub issue response.');return {id:String(x.number),number:x.number,kind:kind==='pulls'?'pull':'issue',title:x.title,state:x.state,url:c.url+(kind==='pulls'?'/pull/':'/issues/')+x.number};
 });
 // Never follow upstream Link URLs; only advance our validated fixed-origin page.
 return {items,nextPage:/rel="next"/.test(link)?page+1:null};
}
