import * as THREE from 'three';
import { SVGRenderer } from 'three/addons/renderers/SVGRenderer.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { typeOf } from './data.js';
export function createHouse(container,onSelect){
 const labels=document.createElement('div');labels.className='scene-labels';container.append(labels);
 let renderer,software=false;try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});}catch{software=true;renderer=new SVGRenderer();renderer.setQuality('low');renderer.setPrecision(2);}
 renderer.setPixelRatio(Math.min(devicePixelRatio,2));if(!software){renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.setClearColor(0x17151e,0);}else{renderer.setClearColor(new THREE.Color(0x17151e));}renderer.outputColorSpace=THREE.SRGBColorSpace;container.prepend(renderer.domElement);renderer.domElement.setAttribute('aria-label','급구 유령의 집 3D 모형. 드래그로 회전하고 스크롤로 확대할 수 있어요. 동료 선택은 아래 목록에서도 가능해요.');
 const scene=new THREE.Scene();const camera=new THREE.PerspectiveCamera(35,1,.1,120);const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.enablePan=false;controls.minDistance=13;controls.maxDistance=32;controls.minPolarAngle=.35;controls.maxPolarAngle=1.25;controls.target.set(0,.4,0);
 scene.add(new THREE.AmbientLight(0xa590bf,2));const sun=new THREE.DirectionalLight(0xffd5aa,4);sun.position.set(-5,12,8);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-10;sun.shadow.camera.right=10;sun.shadow.camera.top=10;sun.shadow.camera.bottom=-10;sun.shadow.normalBias=.04;scene.add(sun);const rim=new THREE.DirectionalLight(0x9c88ff,2);rim.position.set(7,7,-8);scene.add(rim);
 const mats=new Map();const mat=(c,emissive)=>{const key=`${c}-${emissive}`;if(!mats.has(key))mats.set(key,new THREE.MeshStandardMaterial({color:c,roughness:.8,...(emissive?{emissive:c,emissiveIntensity:emissive}:{})}));return mats.get(key)};
 const box=(w,h,d,c,x,y,z,parent=scene)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(c));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;};
 const sphere=(r,c,x,y,z,parent=scene)=>{const m=new THREE.Mesh(new THREE.SphereGeometry(r,software?8:24,software?6:16),mat(c));m.position.set(x,y,z);m.castShadow=true;parent.add(m);return m;};
 const cylinder=(r1,r2,h,c,x,y,z,parent=scene)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,software?10:32),mat(c));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;};
 function sign(text,x,y,z,w=2,color='#c9b3df',rot=0){if(software)return;const can=document.createElement('canvas');can.width=512;can.height=128;const ctx=can.getContext('2d');ctx.clearRect(0,0,512,128);ctx.fillStyle=color;ctx.font='bold 40px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,256,64);const tex=new THREE.CanvasTexture(can);tex.colorSpace=THREE.SRGBColorSpace;const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,w/4),new THREE.MeshBasicMaterial({map:tex,transparent:true,side:THREE.DoubleSide}));mesh.position.set(x,y,z);mesh.rotation.y=rot;scene.add(mesh);return mesh;}
 // A floating, open-front office dollhouse. The walls remain low enough to see every ghost.
 box(12.2,.55,8.3,0x352b47,0,-.48,0);box(11.9,.14,8.05,0x51415c,0,-.13,0);
 box(4.05,.04,7.7,0x655269,-3.7,-.035,0);box(3.65,.04,7.7,0x4c4864,.2,-.035,0);box(3.7,.04,7.7,0x64505b,3.94,-.035,0);
 for(let i=-5;i<=5;i++)box(.015,.015,7.6,0x857087,i,.002,0);
 box(12,.2,.24,0xa38b9e,0,3.55,-3.87);box(12,3.4,.22,0x645073,0,1.72,-3.9);box(.22,3.4,7.8,0x6d5574,-5.9,1.72,0);box(.22,1.25,7.8,0x51445f,5.9,.64,0);
 box(.16,2.4,3.8,0x80627b,-1.65,1.2,-1.8);box(.16,1.8,2.9,0x766077,2.02,.9,-2.35);
 for(let x of [-4.5,-.1,3.9]){box(1.55,1.95,.13,0x352942,x,2.04,-3.73);box(1.25,1.65,.15,0xc28b59,x,2.04,-3.64);box(.08,1.73,.16,0x715270,x,2.04,-3.53);box(1.35,.08,.16,0x715270,x,2.04,-3.53);box(1.7,.1,.35,0x4c354f,x,1.03,-3.55);}
 sign('끝나지 않는 회의',-3.65,3.2,-3.72,3.1);sign('심야 사무실',.15,3.2,-3.72,2.6);sign('탕비실',3.9,3.2,-3.72,2.0);
 // Meeting table, chairs and tiny notebooks.
 box(2.7,.15,1.5,0xb8896c,-3.65,.84,-1.25);for(let x of [-4.55,-2.75])for(let z of [-1.75,-.75])box(.13,.8,.13,0x433449,x,.4,z);
 for(let x of [-4.35,-3.1])for(let z of [-2.45,.02]){box(.64,.13,.64,0x77628b,x,.55,z);box(.64,.67,.12,0x77628b,x,.9,z+(z<0?-.28:.28));box(.12,.5,.12,0x362d45,x,.25,z);}
 box(.6,.035,.42,0xe4c6a2,-3.8,.94,-1.2);box(.36,.035,.32,0x9b7ead,-2.9,.94,-1.4);
 // Workstations with glowing screens.
 for(const [x,z] of [[-.55,-2.5],[.7,.05]]){box(1.75,.15,.85,0xae8674,x,.9,z);for(let dx of [-.7,.7])box(.1,.85,.65,0x493b54,x+dx,.45,z);box(.85,.58,.09,0x282236,x,1.42,z-.1);const screen=box(.74,.45,.02,0x8c79bb,x,1.44,z-.04);screen.material=mat(0x9c8bc4,.5);box(.07,.24,.07,0x2b2639,x,1.06,z-.1);box(.56,.025,.2,0x493d57,x,1.0,z+.22);box(.65,.13,.65,0x79678f,x,.5,z+1);box(.65,.6,.1,0x79678f,x,.85,z+1.3);}
 // Pantry cupboard, coffee machine, candy table.
 box(2.9,1.05,.75,0x9d755f,3.95,.52,-2.95);box(3.05,.12,.9,0xceab87,3.95,1.1,-2.95);for(let x of [3.2,4.25])box(.035,.7,.04,0x795344,x,.51,-2.55);
 box(.55,.75,.45,0x3b3041,3.1,1.5,-2.96);box(.35,.25,.04,0xd5b18b,3.1,1.5,-2.71);cylinder(.12,.1,.22,0xf2dcb8,3.1,1.25,-2.62);
 cylinder(.75,.75,.13,0xc39b76,4,.9,.15);cylinder(.1,.15,.85,0x5a4152,4,.44,.15);cylinder(.35,.22,.24,0x9e6b98,4,1.07,.15);for(let i=0;i<8;i++)sphere(.09,[0xf6ba68,0xc898cf,0x96baa9][i%3],4+Math.sin(i*2)*.24,1.2,.15+Math.cos(i*2)*.24);
 // Front path and steps.
 box(3.1,.22,1.1,0x716073,0,-.35,4.35);box(3.5,.17,.8,0x504258,0,-.52,5.05);box(3.7,.13,.6,0x3c3249,0,-.65,5.58);
 sign('GUBGOO  HAUNTED HOUSE',0,-.4,4.17,4,'#d8b49b');
 const jackGeometry=new THREE.ConeGeometry(.075,.13,3);
 function pumpkin(x,z,s=1,parent=scene){const g=new THREE.Group();g.position.set(x,.32*s,z);g.scale.setScalar(s);parent.add(g);for(let i=0;i<8;i++){const a=i*Math.PI/4;const m=sphere(.29,0xe18a45,Math.sin(a)*.13,0,Math.cos(a)*.13,g);m.scale.y=1.03;}cylinder(.055,.07,.19,0x675043,0,.36,0,g);for(let xx of [-.13,.13]){const eye=new THREE.Mesh(jackGeometry,mat(0x3e293c));eye.position.set(xx,.05,.366);g.add(eye);}box(.15,.045,.02,0x40283c,0,-.13,.4,g);return g;}
 pumpkin(-5,2.7,1.25);pumpkin(-4.25,3.05,.65);pumpkin(5.1,2.65,.9);pumpkin(4.65,3.15,.65);
 // Bare branches, lanterns and bunting.
 function tree(x,z){const group=new THREE.Group();group.position.set(x,0,z);scene.add(group);cylinder(.1,.2,2.7,0x4a3551,0,1.35,0,group);for(let i=0;i<5;i++){const b=cylinder(.035,.075,1.2,0x4a3551,(i%2?.38:-.38),1.2+i*.28,0,group);b.rotation.z=(i%2?-1:1)*.85;}}
 tree(-6.2,-3.3);tree(6.3,-3.5);
 for(let i=0;i<11;i++){const m=new THREE.Mesh(new THREE.ConeGeometry(.17,.35,3),mat(i%2?0xcf864d:0xb19bbf));m.rotation.z=Math.PI;m.position.set(-5.3+i*1.05,3.48-Math.sin(i/10*Math.PI)*.35,-3.5);scene.add(m);}
 for(let x of [-5.4,5.4]){cylinder(.15,.2,.38,0xffc375,x,.25,3.4);const light=new THREE.PointLight(0xffa65c,3,3);light.position.set(x,.65,3.4);scene.add(light);}
 // A crescent moon and sparse floating stars frame the diorama.
 const moon=sphere(.67,0xffd597,5.7,5.3,-4);moon.material=mat(0xffd597,.6);sphere(.61,0x17151e,6,5.5,-3.8);
 const stars=new THREE.Group();for(let i=0;i<25;i++){const x=Math.sin(i*37)*8,z=-4-Math.abs(Math.cos(i*13))*3,y=2+((i*17)%40)/10;const s=sphere(.025+(i%3)*.012,0xd5c3e8,x,y,z,stars);s.material=mat(0xd5c3e8,.6);}scene.add(stars);
 let actors=[],ghosts=[];const selectable=[];const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 function disposeGroup(g){g.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material&&!Array.from(mats.values()).includes(o.material)){o.material.map?.dispose();o.material.dispose();}});scene.remove(g);}
 function setGhosts(next){actors.forEach(a=>{disposeGroup(a.group);a.label.remove()});actors=[];selectable.length=0;ghosts=next;const counts={meeting:0,office:0,pantry:0,lobby:0};const positions={meeting:[-3.7,1.7],office:[.2,1.9],pantry:[3.5,1.8],lobby:[-.8,3.25]};for(const [i,g] of next.entries()){
 const t=typeOf(g.type);const count=counts[t.room]++;const [bx,bz]=positions[t.room];const x=bx+(count%3-1)*.82,z=bz+Math.floor(count/3)*.63;const group=new THREE.Group();scene.add(group);group.position.set(x,.67,z);
 const active=g.trick&&g.trick.expiresAt>Date.now()?g.trick:null;
 if(active?.id==='pumpkin'){pumpkin(0,0,1.1,group);}else{
 const body=new THREE.Mesh(new THREE.CylinderGeometry(.32,.43,.62,software?12:32),mat(t.color));body.position.y=.05;group.add(body);sphere(.32,t.color,0,.36,0,group);for(let j=0;j<7;j++)sphere(.115,t.color,Math.cos(j/7*Math.PI*2)*.32,-.25,Math.sin(j/7*Math.PI*2)*.32,group);
 for(let xx of [-.115,.115]){const eye=sphere(.046,0x352842,xx,.27,.294,group);eye.scale.y=1.45;}const mouth=sphere(.035,0x584260,0,.15,.326,group);mouth.scale.y=.7;
 for(let xx of [-.24,.24]){const cheek=sphere(.065,0xe898a2,xx,.14,.26,group);cheek.scale.z=.3;}for(let xx of [-.37,.37]){const arm=sphere(.12,t.color,xx,.01,.02,group);arm.scale.set(.7,1.45,.8);arm.rotation.z=xx<0?-.7:.7;}
 if(t.id==='wizard'){const hat=new THREE.Mesh(new THREE.ConeGeometry(.35,.67,24),mat(0x69527f));hat.position.y=.85;hat.rotation.z=-.15;group.add(hat);cylinder(.44,.44,.06,0x69527f,0,.57,0,group);}
 if(t.id==='wolf'){for(let xx of [-.23,.23]){const ear=new THREE.Mesh(new THREE.ConeGeometry(.13,.3,3),mat(t.color));ear.position.set(xx,.66,0);group.add(ear);}}
 if(t.id==='vampire'){const cape=box(.75,.6,.12,0x79425f,0,0,-.22,group);cape.rotation.z=.08;}
 if(t.id==='pumpkin'){cylinder(.07,.09,.15,0x806346,0,.74,0,group);}
 }
 const shadow=new THREE.Mesh(new THREE.CircleGeometry(.43,software?10:32),new THREE.MeshBasicMaterial({color:0x211729,transparent:true,opacity:.25,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=-.64;group.add(shadow);
 group.traverse(o=>{if(o.isMesh){o.userData.ghostId=g.id;selectable.push(o);o.castShadow=true;}});
 const label=document.createElement('button');label.className='ghost-label';label.textContent=(active?.id==='boo'?'👻 퇴근… 시켜줘… · ':active?.id==='sparkle'?'✨ ':'')+g.nickname;label.setAttribute('aria-label',`${g.nickname}, ${t.name} 보기`);label.addEventListener('click',()=>onSelect(g.id));labels.append(label);actors.push({group,label,base:.67,phase:i*1.8,id:g.id,room:t.room});
 }}
 const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();let down;renderer.domElement.addEventListener('pointerdown',e=>down=[e.clientX,e.clientY]);renderer.domElement.addEventListener('pointerup',e=>{if(!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>7)return;const r=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);const h=ray.intersectObjects(selectable,false)[0];if(h)onSelect(h.object.userData.ghostId);});
 let filter='all';function focus(roomOrId){const a=actors.find(a=>a.id===roomOrId);filter=a?'all':roomOrId;actors.forEach(a=>{a.group.visible=filter==='all'||a.room===filter;a.label.style.display=a.group.visible?'':'none';});if(a){controls.target.copy(a.group.position);camera.position.copy(a.group.position).add(new THREE.Vector3(7,7,10));}else{controls.target.set(0,.4,0);}controls.update();}
 function reset(){filter='all';camera.position.set(15,14,20);controls.target.set(0,.5,0);actors.forEach(a=>{a.group.visible=true;a.label.style.display=''});controls.update();}
 function zoom(dir){camera.position.sub(controls.target).multiplyScalar(dir>0?.85:1.18).add(controls.target);controls.update();}
 const resize=new ResizeObserver(()=>{const {width,height}=container.getBoundingClientRect();camera.aspect=width/height;camera.updateProjectionMatrix();renderer.setSize(width,height);});resize.observe(container);reset();
 let raf,last=0;const projected=new THREE.Vector3();function animate(time){raf=requestAnimationFrame(animate);if(document.hidden||(software&&time-last<80))return;last=time;controls.update();for(const a of actors){a.group.position.y=a.base+(reduced?0:Math.sin(time*.0017+a.phase)*.09);a.group.rotation.y=reduced?0:Math.sin(time*.0008+a.phase)*.13;projected.copy(a.group.position).add(new THREE.Vector3(0,1.15,0)).project(camera);const w=container.clientWidth,h=container.clientHeight;a.label.style.transform=`translate(-50%,-50%) translate(${(projected.x*.5+.5)*w}px,${(-projected.y*.5+.5)*h}px)`;a.label.style.opacity=projected.z>1?'0':'1';}renderer.render(scene,camera);}animate(0);
 return {setGhosts,focus,reset,zoom,dispose(){cancelAnimationFrame(raf);resize.disconnect();controls.dispose();scene.traverse(o=>o.geometry?.dispose());mats.forEach(m=>m.dispose());renderer.dispose?.();}};
}
