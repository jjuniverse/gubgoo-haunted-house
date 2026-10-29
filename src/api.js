import { demoGhosts, uuid } from './data.js';
export const API=(import.meta.env.VITE_API_URL||'').replace(/\/$/,'');
export const isDemo=!API;
const KEY='gubgoo-halloween-v1';
export function readDemo(){try {const s=JSON.parse(localStorage.getItem(KEY));if(s&&Array.isArray(s.ghosts)&&Array.isArray(s.events))return s;}catch{}return {ghosts:demoGhosts(),events:[],me:null};}
export function writeDemo(s){localStorage.setItem(KEY,JSON.stringify(s));}
export async function request(path,options={}){const r=await fetch(API+path,{...options,headers:{'Content-Type':'application/json',Authorization:`Bearer ${sessionStorage.getItem('ghost-token')||''}`,...options.headers}});const data=await r.json();if(!r.ok){if(r.status===401)sessionStorage.removeItem('ghost-token');throw new Error(data.error||'잠시 후 다시 시도해 주세요.');}return data;}
export async function login(){const nonce=uuid();sessionStorage.setItem('ghost-login-nonce',nonce);location.assign(`${API}/auth/start?nonce=${encodeURIComponent(nonce)}`);}
export function acceptLogin(){const h=new URLSearchParams(location.hash.slice(1));if(h.has('token')){const expected=sessionStorage.getItem('ghost-login-nonce');if(expected&&h.get('nonce')===expected)sessionStorage.setItem('ghost-token',h.get('token'));sessionStorage.removeItem('ghost-login-nonce');history.replaceState(null,'',location.pathname+location.search);}if(h.has('error')){history.replaceState(null,'',location.pathname);throw new Error(h.get('error'));}}
