const frame=document.getElementById('frame');
function fit(){const s=Math.min(1,innerWidth/1440);frame.style.zoom=s;}
fit();addEventListener('resize',fit);
const ov=document.getElementById('ov'), msg=document.getElementById('msg');
const ids=['cur','nw','cf'].map(i=>document.getElementById(i));
function openPw(){ids.forEach(i=>i.value='');msg.textContent='';msg.className='msg';ov.classList.add('open');ids[0].focus()}
function closePw(){ov.classList.remove('open')}
document.getElementById('openPw').onclick=openPw;
document.getElementById('closePw').onclick=closePw;
ov.addEventListener('click',e=>{if(e.target===ov)closePw()});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closePw()});
document.getElementById('save').onclick=()=>{
  const [c,n,f]=ids.map(i=>i.value);
  msg.className='msg err';
  if(!c||!n||!f){msg.textContent='Please fill in all three fields.';return}
  if(n.length<8){msg.textContent='New password must be at least 8 characters.';return}
  if(n!==f){msg.textContent='New passwords do not match.';return}
  msg.className='msg ok';msg.textContent='Password changed.';
  setTimeout(closePw,1000);
};
