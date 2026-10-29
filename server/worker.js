import { QUESTIONS, TRICKS, resultType } from '../src/data.js';
const json=(obj,status=200)=>new Response(JSON.stringify(obj),{status,headers:{'Content-Type':'application/json;charset=utf-8','Cache-Control':'no-store'}});
const failure=(text,status=400)=>Object.assign(new Error(text),{status});
const idPattern=/^[A-Za-z0-9-]{8,80}$/;
export async function hash(value){return [...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))].map(x=>x.toString(16).padStart(2,'0')).join('');}
export function validateProfile(body){if(typeof body.nickname!=='string'||!body.nickname.trim()||body.nickname.trim().length>20)throw failure('이름을 1~20자로 입력해 주세요.');if(!Array.isArray(body.answers)||body.answers.length!==QUESTIONS.length||body.answers.some((a,i)=>!QUESTIONS[i].a.some(choice=>choice[1]===a)))throw failure('다섯 가지 질문에 모두 답해 주세요.');return {nickname:body.nickname.trim(),type:resultType(body.answers).id};}
export function validateInteraction(body){if(!['treat','trick'].includes(body.kind)||typeof body.toId!=='string'||!idPattern.test(body.toId)||typeof body.requestId!=='string'||!idPattern.test(body.requestId))throw failure('올바르지 않은 요청이에요.');if(body.kind==='trick'&&!TRICKS.some(t=>t.id===body.trick))throw failure('장난을 다시 선택해 주세요.');if(typeof body.message!=='string'||body.message.length>200)throw failure('메시지는 200자까지 입력할 수 있어요.');return {...body,message:body.message.trim(),trick:body.kind==='trick'?body.trick:null};}
async function bodyOf(req){const s=await req.text();if(s.length>4096)throw failure('요청이 너무 커요.',413);try{return JSON.parse(s);}catch{throw failure('요청을 읽지 못했어요.');}}
async function slack(env,method,payload){const response=await fetch(`https://slack.com/api/${method}`,{method:'POST',headers:{Authorization:`Bearer ${env.SLACK_BOT_TOKEN}`,'Content-Type':'application/json; charset=utf-8'},body:JSON.stringify(payload),signal:AbortSignal.timeout(8000)});const data=await response.json();if(!data.ok)throw failure('슬랙 연결을 확인해 주세요.',502);return data;}
const redirect=url=>new Response(null,{status:302,headers:{Location:url,'Cache-Control':'no-store','Referrer-Policy':'no-referrer'}});
const publicUser=u=>({id:u.id,nickname:u.nickname,type:u.type,candies:u.candies,trick:u.trick&&u.trick_expires>Date.now()?{id:u.trick,expiresAt:u.trick_expires}:null});
async function authenticate(req,env){const token=(req.headers.get('Authorization')||'').replace(/^Bearer /,'');if(!token||token.length>200)throw failure('슬랙으로 다시 로그인해 주세요.',401);const user=await env.DB.prepare('SELECT u.* FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>?').bind(await hash(token),Date.now()).first();if(!user)throw failure('로그인이 만료됐어요. 슬랙으로 다시 입장해 주세요.',401);return user;}
export async function route(req,env){
 const url=new URL(req.url),now=Date.now();
 if(url.pathname==='/health')return json({ok:true});
 if(url.pathname==='/auth/start'&&req.method==='GET'){
  const nonce=url.searchParams.get('nonce');if(!nonce||!idPattern.test(nonce))throw failure('브라우저에서 로그인을 다시 시작해 주세요.');
  const state=crypto.randomUUID()+crypto.randomUUID();await env.DB.batch([env.DB.prepare('DELETE FROM oauth_states WHERE expires_at<?').bind(now),env.DB.prepare('INSERT INTO oauth_states(state,nonce,expires_at) VALUES(?,?,?)').bind(state,nonce,now+600000)]);
  const auth=new URL('https://slack.com/oauth/v2/authorize');auth.searchParams.set('client_id',env.SLACK_CLIENT_ID);auth.searchParams.set('scope','chat:write,im:write,users:read');auth.searchParams.set('user_scope','users:read');auth.searchParams.set('team',env.SLACK_TEAM_ID);auth.searchParams.set('redirect_uri',url.origin+'/auth/callback');auth.searchParams.set('state',state);return redirect(auth.href);
 }
 if(url.pathname==='/auth/callback'&&req.method==='GET'){
  const state=url.searchParams.get('state');const stored=state?await env.DB.prepare('DELETE FROM oauth_states WHERE state=? AND expires_at>? RETURNING nonce').bind(state,now).first():null;
  if(!stored)return redirect(env.APP_URL+'#error='+encodeURIComponent('로그인 요청이 만료됐어요. 다시 시작해 주세요.'));
  if(url.searchParams.has('error')||!url.searchParams.get('code'))return redirect(env.APP_URL+'#error='+encodeURIComponent('슬랙 로그인이 취소됐어요.'));
  const response=await fetch('https://slack.com/api/oauth.v2.access',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:env.SLACK_CLIENT_ID,client_secret:env.SLACK_CLIENT_SECRET,code:url.searchParams.get('code'),redirect_uri:url.origin+'/auth/callback'}),signal:AbortSignal.timeout(8000)});const auth=await response.json();
  if(!auth.ok||auth.team?.id!==env.SLACK_TEAM_ID||!auth.authed_user?.id)return redirect(env.APP_URL+'#error='+encodeURIComponent('니더 슬랙 계정으로만 참여할 수 있어요.'));
  const info=await slack(env,'users.info',{user:auth.authed_user.id});const u=info.user;if(!u||u.deleted||u.is_bot||u.is_restricted||u.is_ultra_restricted||u.team_id!==env.SLACK_TEAM_ID)throw failure('활성 직원 계정으로 로그인해 주세요.',403);
  const token=crypto.randomUUID()+crypto.randomUUID();await env.DB.batch([env.DB.prepare('INSERT INTO users(id,nickname,created_at) VALUES(?,?,?) ON CONFLICT(id) DO NOTHING').bind(u.id,(u.profile?.display_name||u.real_name||u.name).slice(0,20),now),env.DB.prepare('DELETE FROM sessions WHERE expires_at<?').bind(now),env.DB.prepare('INSERT INTO sessions(token_hash,user_id,expires_at) VALUES(?,?,?)').bind(await hash(token),u.id,now+86400000)]);
  return redirect(env.APP_URL+'#'+new URLSearchParams({token,nonce:stored.nonce}));
 }
 if(!url.pathname.startsWith('/api/'))return json({error:'찾을 수 없는 주소예요.'},404);
 const user=await authenticate(req,env);
 if(url.pathname==='/api/logout'&&req.method==='POST'){await env.DB.prepare('DELETE FROM sessions WHERE token_hash=?').bind(await hash(req.headers.get('Authorization').replace(/^Bearer /,''))).run();return json({ok:true});}
 if(url.pathname==='/api/house'&&req.method==='GET'){
  const [users,events]=await env.DB.batch([env.DB.prepare('SELECT * FROM users WHERE type IS NOT NULL ORDER BY created_at'),env.DB.prepare('SELECT i.id,a.nickname AS "from",b.nickname AS "to",i.kind,i.created_at AS createdAt FROM interactions i JOIN users a ON a.id=i.from_id JOIN users b ON b.id=i.to_id ORDER BY i.created_at DESC LIMIT 10')]);return json({ghosts:users.results.map(publicUser),events:events.results,me:user.type?publicUser(user):null});
 }
 if(url.pathname==='/api/profile'&&req.method==='POST'){const p=validateProfile(await bodyOf(req));await env.DB.prepare('UPDATE users SET nickname=?,type=? WHERE id=?').bind(p.nickname,p.type,user.id).run();return json({ok:true});}
 if(url.pathname==='/api/inbox'&&req.method==='GET'){const rows=await env.DB.prepare('SELECT i.id,a.nickname AS "from",i.kind,i.trick,i.message,i.created_at AS createdAt FROM interactions i JOIN users a ON a.id=i.from_id WHERE i.to_id=? ORDER BY i.created_at DESC LIMIT 100').bind(user.id).all();return json(rows.results);}
 if(url.pathname==='/api/interactions'&&req.method==='POST'){
  if(!user.type)throw failure('먼저 내 유령을 만들어 주세요.');const b=validateInteraction(await bodyOf(req));if(b.toId===user.id)throw failure('다른 동료에게 인사를 보내 주세요.');
  const prior=await env.DB.prepare('SELECT * FROM interactions WHERE id=?').bind(b.requestId).first();if(prior){if(prior.from_id!==user.id)throw failure('요청 ID가 중복됐어요.',409);return json({ok:true,notification:prior.notification});}
  const target=await env.DB.prepare('SELECT * FROM users WHERE id=? AND type IS NOT NULL').bind(b.toId).first();if(!target)throw failure('동료의 유령을 찾지 못했어요.',404);
  try{await env.DB.prepare('INSERT INTO interactions(id,from_id,to_id,kind,trick,message,created_at) VALUES(?,?,?,?,?,?,?)').bind(b.requestId,user.id,target.id,b.kind,b.trick,b.message,now).run();}catch(e){if(String(e).includes('cooldown'))throw failure('방금 인사를 보냈어요. 30초 후에 다시 보내 주세요.',429);if(String(e).includes('daily_limit'))throw failure('오늘은 100번의 인사를 모두 보냈어요.',429);throw e;}
  let notification='failed';try{const dm=await slack(env,'conversations.open',{users:target.id});const title=`${b.kind==='treat'?'🍬':'🕷️'} ${user.nickname}님이 ${b.kind==='treat'?'사탕을 보냈어요!':'장난을 걸었어요!'}`;const detail=b.kind==='treat'?(b.message||'오늘도 함께해 줘서 고마워요!'):TRICKS.find(t=>t.id===b.trick).desc;
  await slack(env,'chat.postMessage',{channel:dm.channel.id,text:title,unfurl_links:false,unfurl_media:false,blocks:[{type:'section',text:{type:'plain_text',text:title+'\n'+detail,emoji:true}},{type:'actions',elements:[{type:'button',text:{type:'plain_text',text:'👻 내 유령 확인하기'},url:env.APP_URL,action_id:'open_ghost_house'}]}]});notification='sent';}catch{/* Delivery failures are recorded and reported without rolling back the gift. */}
  await env.DB.prepare('UPDATE interactions SET notification=? WHERE id=?').bind(notification,b.requestId).run();return json({ok:true,notification},201);
 }
 return json({error:'지원하지 않는 요청이에요.'},404);
}
export default {async fetch(req,env){const allowed=new URL(env.APP_URL).origin;const origin=req.headers.get('Origin');if(origin&&origin!==allowed)return json({error:'허용되지 않은 요청이에요.'},403);let response;if(req.method==='OPTIONS'){response=new Response(null,{status:204});}else{try{response=await route(req,env);}catch(e){response=json({error:e.status?e.message:'잠시 후 다시 시도해 주세요.'},e.status||500);}}
 const headers=new Headers(response.headers);headers.set('Access-Control-Allow-Origin',allowed);headers.set('Vary','Origin');headers.set('Access-Control-Allow-Headers','Content-Type, Authorization');headers.set('Access-Control-Allow-Methods','GET, POST, OPTIONS');headers.set('X-Content-Type-Options','nosniff');headers.set('Referrer-Policy','no-referrer');headers.set('Cache-Control','no-store');return new Response(response.body,{status:response.status,headers});}};
