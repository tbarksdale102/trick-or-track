import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {readFile,writeFile,mkdir,rename} from 'node:fs/promises';
import {connection,query,page} from './jira.mjs';
import {reconcile} from './reconcile.mjs';
import {autoReconcile,validateRules} from './auto-reconcile.mjs';
const root=new URL('./.runtime/',import.meta.url);
const day=24*60*60*1000;
async function read(name,fallback){try{return JSON.parse(await readFile(new URL(name,root),'utf8'));}catch(e){if(e.code==='ENOENT')return fallback;throw Error('Saved schedule data could not be read.');}}
async function write(name,value){await mkdir(root,{recursive:true});const temp=new URL(name+'.tmp',root);await writeFile(temp,JSON.stringify(value));await rename(temp,new URL(name,root));}
function secret(mode,value){return new Promise((resolve,reject)=>{const child=spawn('powershell.exe',['-NoProfile','-NonInteractive','-File',fileURLToPath(new URL('./credential.ps1',import.meta.url)),mode],{windowsHide:true,stdio:['pipe','pipe','pipe']});let output='';child.stdout.on('data',b=>output+=b);child.stderr.resume();child.on('error',()=>reject(Error('Windows credential protection is unavailable.')));child.on('close',code=>code===0?resolve(output):reject(Error('Unable to protect or read the saved Jira credential for this Windows user.')));child.stdin.on('error',()=>{});child.stdin.end(value);});}
export async function fetchSnapshot(config,fetchPage=page){const issues=new Map(),seen=new Set();let cursor=null,site;do{const result=await fetchPage({...config,cursor});site=result.site;for(const i of result.issues)issues.set(i.id,i);cursor=result.cursor;if(cursor!==null){if(seen.has(cursor))throw Error('Repeated Jira page token; previous snapshot retained.');seen.add(cursor);}}while(cursor!==null);return {site,scope:config.scope==='all'?'All accessible projects':config.project,issues:[...issues.values()],at:new Date().toISOString()};}
let running=false,editing=false;
export async function status(){const s=await read('schedule.json',null);return {enabled:!!s?.enabled,running,site:s?.config.url,scope:s?.config.scope==='all'?'All accessible projects':s?.config.project,nextRun:s?.nextRun,lastRun:s?.lastRun,lastSuccess:s?.lastSuccess,error:s?.error,intervalHours:24};}
export async function snapshot(){return read('snapshot.json',null);}
export async function configure(input){if(running||editing)throw Error('A refresh or schedule update is in progress. Try again when it finishes.');editing=true;try{if(input.enabled===false){const s=await read('schedule.json',null);if(s){s.enabled=false;await write('schedule.json',s);}return status();}
 if(input.retainCredential!==true)throw Error('Enable encrypted credential retention to schedule refreshes.');connection(input);query(input);validateRules(input.rules);if(input.rules?.enabled&&input.scope==='project'&&input.rules.project!==input.project)throw Error('Creation project must match the import project.');
 const {token,...config}=input;delete config.retainCredential;delete config.enabled;
 const encryptedToken=await secret('protect',token);
 await write('schedule.json',{config,encryptedToken,enabled:true,nextRun:new Date().toISOString(),error:null});return status();
 }finally{editing=false;}}
export async function runDue(force=false){if(running||editing)return;running=true;try{const s=await read('schedule.json',null);if(!s?.enabled||(!force&&Date.now()<Date.parse(s.nextRun)))return;
 try{const token=await secret('unprotect',s.encryptedToken);const config={...s.config,token};let next=await fetchSnapshot(config);const previous=await snapshot();const ledger=await read('actions.json',{});const automation=await autoReconcile(config,next.issues,ledger,l=>write('actions.json',l));if(automation.actions.length)next=await fetchSnapshot(config);next.reconciliation=reconcile(next.issues,previous?.site===next.site&&previous?.scope===next.scope?previous.issues:[]);next.automation=automation;await write('snapshot.json',next);s.lastSuccess=next.at;s.error=null;}catch(e){s.error=e.message;}
 s.lastRun=new Date().toISOString();s.nextRun=new Date(Date.now()+day).toISOString();await write('schedule.json',s);
 }finally{running=false;}}
export function startScheduler(){const tick=()=>runDue().catch(()=>{});tick();const timer=setInterval(tick,60000);timer.unref();}
