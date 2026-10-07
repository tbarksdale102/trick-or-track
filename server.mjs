import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {page} from './jira.mjs';
import {ticketAction} from './tickets.mjs';
import {status,snapshot,configure,runDue,startScheduler} from './schedule.mjs';
startScheduler();
const files={'/':'index.html','/app.js':'app.js','/development.js':'development.js','/domain.js':'domain.js','/styles.css':'styles.css','/jira-ui.js':'jira-ui.js','/tickets-ui.js':'tickets-ui.js','/reconcile.js':'../reconcile.mjs'};
http.createServer(async(req,res)=>{
 const pathname=new URL(req.url,'http://localhost').pathname;
 res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
 if(!['127.0.0.1:4173','localhost:4173'].includes(req.headers.host)){res.writeHead(403);return res.end('Invalid host');}
 if(pathname==='/api/jira/tickets'){
  res.setHeader('Content-Type','application/json');
  if(req.method!=='POST'||req.headers.origin!==`http://${req.headers.host}`||req.headers['content-type']!=='application/json'){res.writeHead(403);return res.end(JSON.stringify({error:'Same-origin JSON requests required.'}));}
  try{let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>200000)throw Error('Ticket request is too large.');}res.end(JSON.stringify(await ticketAction(JSON.parse(raw))));}catch(e){res.writeHead(400);res.end(JSON.stringify({error:e.message}));}return;
 }
 if(pathname.startsWith('/api/jira/schedule')){
  res.setHeader('Content-Type','application/json');
  if(req.method!=='POST'||req.headers.origin!==`http://${req.headers.host}`||req.headers['content-type']!=='application/json'){res.writeHead(403);return res.end(JSON.stringify({error:'Same-origin JSON requests required.'}));}
  try{let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>32000)throw Error('Request too large.');}const input=JSON.parse(raw);
   if(pathname==='/api/jira/schedule/status')res.end(JSON.stringify(await status()));
   else if(pathname==='/api/jira/schedule/snapshot')res.end(JSON.stringify(await snapshot()));
   else if(pathname==='/api/jira/schedule/configure')res.end(JSON.stringify(await configure(input)));
   else if(pathname==='/api/jira/schedule/run'){runDue(true).catch(()=>{});res.end(JSON.stringify({started:true}));}
   else {res.writeHead(404);res.end(JSON.stringify({error:'Not found'}));}
  }catch(e){res.writeHead(400);res.end(JSON.stringify({error:e.message}));}return;
 }
 if(pathname==='/api/jira/page'){
  res.setHeader('Content-Type','application/json');
  if(req.method!=='POST'||req.headers.origin!==`http://${req.headers.host}`||req.headers['content-type']!=='application/json'){res.writeHead(403);return res.end(JSON.stringify({error:'Same-origin JSON requests required.'}));}
  try{let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>32000)throw Error('Request too large.');}const result=await page(JSON.parse(raw));res.end(JSON.stringify(result));}catch(e){res.writeHead(e.status||400);res.end(JSON.stringify({error:e.message}));}return;
 }
 const path=files[pathname];if(!path){res.writeHead(404);return res.end('Not found');}
 try{const data=await readFile(new URL('./dist/'+path,import.meta.url));res.writeHead(200,{'Content-Type':(path.endsWith('.js')||path.endsWith('.mjs'))?'text/javascript':path.endsWith('.css')?'text/css':'text/html'});res.end(data);}catch{res.writeHead(500);res.end('Unable to load application');}
}).listen(4173,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:4173'));



