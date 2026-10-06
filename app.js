const content = document.querySelector('#contentArea');
const nav = document.querySelector('#sideNav');
const appShell = document.querySelector('.app-shell');
const toast = document.querySelector('#toast');
let role = 'admin';
let currentView = location.hash.slice(1) || 'assessments';
let currentPage = 1;
let toastTimer;

let accounts = [
  {name:'Gemar Enopia',id:'2026-010',program:'BS Information Technology',year:'3rd Year',assessed:28450,paid:20000,status:'Partial'},
  {name:'Rhea Lyn Polosan',id:'2026-011',program:'BS Information Technology',year:'3rd Year',assessed:28450,paid:28450,status:'Paid'},
  {name:'Joshryl Matugas',id:'2026-012',program:'BS Information Technology',year:'3rd Year',assessed:28450,paid:15000,status:'Partial'},
  {name:'Mikaela Santos',id:'2026-013',program:'BS Information Technology',year:'3rd Year',assessed:28450,paid:28450,status:'Paid'},
  {name:'Daniel Cruz',id:'2026-014',program:'BS Information Technology',year:'3rd Year',assessed:28450,paid:10000,status:'Overdue'},
  {name:'Alyssa Reyes',id:'2026-015',program:'BS Information Technology',year:'3rd Year',assessed:28450,paid:20000,status:'Partial'},
  {name:'Paolo Mendoza',id:'2026-016',program:'BS Information Technology',year:'3rd Year',assessed:28450,paid:28450,status:'Paid'}
];
const payments = [
  {date:'09/20/2026',student:'Gemar Enopia',id:'2026-010',ref:'CEC-260920-0101',method:'Bank transfer',amount:10000,status:'Posted'},
  {date:'09/18/2026',student:'Rhea Lyn Polosan',id:'2026-011',ref:'CEC-260918-0114',method:'Cashier',amount:9500,status:'Posted'},
  {date:'09/15/2026',student:'Joshryl Matugas',id:'2026-012',ref:'CEC-260915-0122',method:'Online',amount:5000,status:'Posted'},
  {date:'09/12/2026',student:'Mikaela Santos',id:'2026-013',ref:'CEC-260912-0133',method:'Cashier',amount:10000,status:'Posted'},
  {date:'09/10/2026',student:'Daniel Cruz',id:'2026-014',ref:'CEC-260910-0140',method:'Bank transfer',amount:10000,status:'Posted'}
];

function money(value){return `₱ ${Number(value).toLocaleString('en-PH',{minimumFractionDigits:2,maximumFractionDigits:2})}`}
function safe(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function notify(message){toast.textContent=message;toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),2300)}
function navItems(){return role==='admin'?
  [['assessments','▣','Student Assessments'],['payments','▤','Payment Records'],['fee-structure','▦','Fee Structure']]:
  [['my-assessment','▣','My Assessment'],['fee-breakdown','▤','Fee Breakdown'],['payment-history','▦','Payment History']];}
function breadcrumb(label){return `<p class="breadcrumb">${role==='admin'?'Admin':'Student'} / Tuition &amp; Assessment / ${label}</p>`}
function pageHead(title,desc,action=''){return `<div class="page-head"><div>${breadcrumb(title)}<h1 class="page-title">${title}</h1><p class="page-desc">${desc}</p></div>${action}</div>`}
function stats(items){return `<div class="stats-grid">${items.map(([icon,value,label],i)=>`<div class="stat-card ${i===0?'selected':''}"><div class="stat-icon">${icon}</div><div class="stat-value">${value}</div><div class="stat-label">${label}</div></div>`).join('')}</div>`}
function badge(text){let cls=text.toLowerCase()==='paid'||text.toLowerCase()==='posted'?'current':text.toLowerCase()==='overdue'?'flagged':'updated';return `<span class="status ${cls}">${safe(text)}</span>`}
function searchBar(placeholder='Search student name / ID'){return `<div class="toolbar"><label class="search-box"><span>⌕</span><input id="tableSearch" placeholder="${placeholder}" aria-label="${placeholder}"></label></div>`}
function pager(total){const pages=Math.max(1,Math.ceil(total/5));currentPage=Math.min(currentPage,pages);return `<div class="table-footer"><span id="resultCount"></span><div class="pagination" id="pagination">${Array.from({length:pages+2},(_,i)=>{if(i===0)return `<button data-page="${currentPage-1}" ${currentPage===1?'disabled':''}>‹</button>`;if(i===pages+1)return `<button data-page="${currentPage+1}" ${currentPage===pages?'disabled':''}>›</button>`;return `<button data-page="${i}" class="${currentPage===i?'active':''}">${i}</button>`}).join('')}</div></div>`}
function adminAssessments(){
  const total=accounts.length,paid=accounts.filter(a=>a.status==='Paid').length,overdue=accounts.filter(a=>a.status==='Overdue').length,balance=accounts.reduce((n,a)=>n+a.assessed-a.paid,0);
  return `${pageHead('Student Assessments','Review student tuition assessments, balances, and account standing.','<button class="primary-button" id="addAssessment">＋ Add Assessment</button>')}
    ${stats([['👥',String(total).padStart(3,'0'),'Student Accounts'],['✓',String(paid).padStart(3,'0'),'Paid in Full'],['◷',String(total-paid-overdue).padStart(3,'0'),'Partial Balance'],['⚑',String(overdue).padStart(3,'0'),'Overdue']])}
    ${searchBar()}<div class="toolbar"><select id="accountStatus" aria-label="Filter account status"><option value="all">All Statuses</option><option>Paid</option><option>Partial</option><option>Overdue</option></select><select id="accountYear" aria-label="Filter year"><option value="all">All Year Levels</option><option>3rd Year</option></select></div>
    <div class="table-wrap"><table><thead><tr><th>Student</th><th>ID Number</th><th>Program</th><th>Year Level</th><th>Assessment</th><th>Paid</th><th>Balance</th><th>Status</th><th>Actions</th></tr></thead><tbody id="tableRows"></tbody></table></div>${pager(total)}<p class="page-desc">Outstanding balance across accounts: <strong>${money(balance)}</strong></p>`;
}
function adminPayments(){return `${pageHead('Payment Records','Review and track tuition payments received from students.','<button class="primary-button" id="exportPayments">⇩ Export Records</button>')}
  ${stats([['₱',money(payments.reduce((n,p)=>n+p.amount,0)),'Payments Posted'],['▤',String(payments.length).padStart(3,'0'),'Transactions'],['✓','100%','Reconciled'],['◷','Today','Last Updated']])}
  ${searchBar('Search student, ID, or reference')}<div class="table-wrap"><table><thead><tr><th>Date</th><th>Student</th><th>ID Number</th><th>Reference</th><th>Method</th><th>Amount</th><th>Status</th><th>Actions</th></tr></thead><tbody id="tableRows"></tbody></table></div>${pager(payments.length)}`}
function feeStructure(){return `${pageHead('Fee Structure','Current tuition and fees for Academic Year 2026–2027.','<button class="primary-button" id="editFees">✎ Edit Fee Structure</button>')}
  <div class="panel-grid"><div class="panel"><div class="stat-icon">📘</div><h3>Program</h3><p>BS Information Technology</p></div><div class="panel"><div class="stat-icon">🏫</div><h3>Academic Year</h3><p>2026–2027 · 1st Semester</p></div><div class="panel"><div class="stat-icon">₱</div><h3>Total per Student</h3><div class="money">${money(28450)}</div></div></div>
  <div class="info-card"><h3>Assessment Components</h3>${[['Tuition fee','₱ 20,000.00'],['Laboratory & technology','₱ 4,250.00'],['Miscellaneous fees','₱ 4,200.00']].map(([label,value])=>`<div class="info-line"><span>${label}</span><strong>${value}</strong></div>`).join('')}<div class="info-line"><strong>Total Assessment</strong><strong>${money(28450)}</strong></div></div>`}
function studentAssessment(){return `${pageHead('My Tuition Assessment','Your current school year assessment and account standing.','<button class="primary-button" id="downloadAssessment">⇩ Download Assessment</button>')}
  <div class="panel-grid"><div class="panel"><div class="stat-icon">📘</div><h3>Academic Year</h3><p>2026–2027 · 1st Semester</p></div><div class="panel"><div class="stat-icon">💳</div><h3>Total Assessment</h3><div class="money">${money(28450)}</div></div><div class="panel"><div class="stat-icon">✓</div><h3>Account Status</h3><p>${badge('Partial')}</p></div></div>
  <div class="payment-card"><div><h3 style="font:700 12px Manrope;margin:0 0 5px">Outstanding Balance</h3><div class="money">${money(8450)}</div><p>Next installment due October 20, 2026</p></div><button class="primary-button" id="payNow">Payment Options</button></div>
  <div class="info-grid"><div class="info-card"><h3>Assessment Breakdown</h3>${[['Tuition fee','₱ 20,000.00'],['Laboratory & technology','₱ 4,250.00'],['Miscellaneous fees','₱ 4,200.00']].map(([label,value])=>`<div class="info-line"><span>${label}</span><strong>${value}</strong></div>`).join('')}<div class="info-line"><strong>Total assessed</strong><strong>${money(28450)}</strong></div></div><div class="info-card"><h3>Installment Summary</h3>${[['Total assessment',money(28450)],['Payments received',money(20000)],['Balance due',money(8450)],['Next due date','October 20, 2026']].map(([label,value])=>`<div class="info-line"><span>${label}</span><strong>${value}</strong></div>`).join('')}</div></div>`}
function studentFees(){return `${pageHead('Fee Breakdown','See the fees included in your current tuition assessment.')}<div class="info-card"><h3>1st Semester · Academic Year 2026–2027</h3>${[['Tuition fee','₱ 20,000.00'],['Laboratory & technology','₱ 4,250.00'],['Miscellaneous fees','₱ 4,200.00'],['Total assessment',money(28450)]].map(([label,value])=>`<div class="info-line"><span>${label}</span><strong>${value}</strong></div>`).join('')}</div>`}
function studentHistory(){return `${pageHead('Payment History','A record of payments posted to your student account.')}<div class="table-wrap"><table><thead><tr><th>Date</th><th>Reference</th><th>Payment Method</th><th>Amount</th><th>Status</th></tr></thead><tbody>${payments.filter(p=>p.id==='2026-010').map(p=>`<tr><td>${p.date}</td><td>${p.ref}</td><td>${p.method}</td><td>${money(p.amount)}</td><td>${badge(p.status)}</td></tr>`).join('')}<tr><td>08/22/2026</td><td>CEC-260822-0109</td><td>Cashier</td><td>${money(10000)}</td><td>${badge('Posted')}</td></tr></tbody></table></div>`}

function render(){
  if(role==='admin'&&!['assessments','payments','fee-structure'].includes(currentView))currentView='assessments';
  if(role==='student'&&!['my-assessment','fee-breakdown','payment-history'].includes(currentView))currentView='my-assessment';
  if(location.hash.slice(1)!==currentView)history.replaceState(null,'',`#${currentView}`);
  nav.innerHTML=navItems().map(([id,icon,label])=>`<a class="nav-link ${currentView===id?'active':''}" href="#${id}" data-view="${id}"><span class="nav-icon">${icon}</span><span>${label}</span></a>`).join('');
  document.querySelector('#accountRole').textContent=role==='admin'?'Administrator':'Student';
  document.querySelector('#accountName').textContent='Gemar Enopia';
  content.innerHTML=role==='admin'?(currentView==='payments'?adminPayments():currentView==='fee-structure'?feeStructure():adminAssessments()):(currentView==='fee-breakdown'?studentFees():currentView==='payment-history'?studentHistory():studentAssessment());
  renderRows();
}
function renderRows(){
  const tbody=document.querySelector('#tableRows');if(!tbody)return;
  const query=(document.querySelector('#tableSearch')?.value||'').toLowerCase();let rows=[];
  if(currentView==='payments'){
    rows=payments.map((p,i)=>({...p,_index:i})).filter(p=>`${p.student} ${p.id} ${p.ref}`.toLowerCase().includes(query));
    tbody.innerHTML=rows.slice((currentPage-1)*5,currentPage*5).map(p=>`<tr><td>${p.date}</td><td class="student-name">${safe(p.student)}</td><td>${p.id}</td><td>${p.ref}</td><td>${p.method}</td><td class="grade">${money(p.amount)}</td><td>${badge(p.status)}</td><td><button class="action-link" data-payment="${p._index}">View</button></td></tr>`).join('')||'<tr><td colspan="8" class="empty-note">No payments found.</td></tr>';
  }else if(currentView==='assessments'){
    const state=document.querySelector('#accountStatus')?.value||'all';const year=document.querySelector('#accountYear')?.value||'all';
    rows=accounts.map((a,i)=>({...a,_index:i})).filter(a=>`${a.name} ${a.id} ${a.program}`.toLowerCase().includes(query)&&(state==='all'||a.status===state)&&(year==='all'||a.year===year));
    tbody.innerHTML=rows.slice((currentPage-1)*5,currentPage*5).map(a=>`<tr><td class="student-name">${safe(a.name)}</td><td>${a.id}</td><td>${safe(a.program)}</td><td>${a.year}</td><td>${money(a.assessed)}</td><td>${money(a.paid)}</td><td class="grade">${money(a.assessed-a.paid)}</td><td>${badge(a.status)}</td><td><button class="action-link" data-account="${a._index}">View / Edit</button></td></tr>`).join('')||'<tr><td colspan="9" class="empty-note">No student accounts match these filters.</td></tr>';
  }
  const count=document.querySelector('#resultCount');if(count)count.textContent=`Showing ${rows.length?((currentPage-1)*5+1):0}–${Math.min(currentPage*5,rows.length)} of ${rows.length} records`;
  const pages=Math.max(1,Math.ceil(rows.length/5)),pagination=document.querySelector('#pagination');if(pagination)pagination.innerHTML=`<button data-page="${currentPage-1}" ${currentPage===1?'disabled':''}>‹</button>${Array.from({length:pages},(_,i)=>`<button data-page="${i+1}" class="${currentPage===i+1?'active':''}">${i+1}</button>`).join('')}<button data-page="${currentPage+1}" ${currentPage===pages?'disabled':''}>›</button>`;
}
function openAccount(index=null){const account=index===null?{name:'',id:'',program:'BS Information Technology',year:'1st Year',assessed:28450,paid:0,status:'Partial'}:accounts[index];const modal=document.createElement('div');modal.className='modal-backdrop';modal.id='modalBackdrop';modal.innerHTML=`<form class="modal" id="accountForm"><h2>${index===null?'Add Student Assessment':'Student Assessment'}</h2><div class="form-grid"><div class="field"><label>Student name</label><input name="name" value="${safe(account.name)}" required></div><div class="field"><label>Student ID</label><input name="id" value="${safe(account.id)}" required></div><div class="field full"><label>Program</label><input name="program" value="${safe(account.program)}" required></div><div class="field"><label>Year level</label><select name="year">${['1st Year','2nd Year','3rd Year','4th Year'].map(y=>`<option ${account.year===y?'selected':''}>${y}</option>`).join('')}</select></div><div class="field"><label>Assessment total (₱)</label><input name="assessed" type="number" min="0" value="${account.assessed}" required></div><div class="field"><label>Paid to date (₱)</label><input name="paid" type="number" min="0" value="${account.paid}" required></div></div><div class="modal-actions"><button type="button" class="secondary-button" id="cancelModal">Cancel</button><button class="primary-button" type="submit">Save Assessment</button></div></form>`;modal.dataset.index=index===null?'':String(index);document.body.append(modal)}

document.querySelector('#sideNav').addEventListener('click',e=>{const link=e.target.closest('[data-view]');if(!link)return;e.preventDefault();currentView=link.dataset.view;currentPage=1;history.replaceState(null,'',`#${currentView}`);render();if(innerWidth<620)appShell.classList.add('nav-closed')});
content.addEventListener('click',e=>{
  const page=e.target.closest('[data-page]');if(page&&!page.disabled){currentPage=Number(page.dataset.page);renderRows();return}
  const account=e.target.closest('[data-account]');if(account){openAccount(Number(account.dataset.account));return}
  if(e.target.closest('#addAssessment')){openAccount();return}
  if(e.target.closest('#downloadAssessment')){notify('Assessment summary is ready to print.');return}
  if(e.target.closest('#payNow')){notify('Please visit the cashier or use the school payment channels.');return}
  if(e.target.closest('#exportPayments')){notify('Payment records are ready to export.');return}
  if(e.target.closest('#editFees')){notify('Fee structure is ready to edit.');return}
  const payment=e.target.closest('[data-payment]');if(payment){const p=payments[Number(payment.dataset.payment)];notify(`${p.ref} · ${money(p.amount)} · ${p.status}`)}
});
content.addEventListener('input',e=>{if(e.target.id==='tableSearch'){currentPage=1;renderRows()}});
content.addEventListener('change',e=>{if(e.target.matches('#accountStatus,#accountYear')){currentPage=1;renderRows()}});
document.body.addEventListener('click',e=>{if(e.target.id==='cancelModal'||e.target.id==='modalBackdrop')document.querySelector('#modalBackdrop')?.remove()});
document.body.addEventListener('submit',e=>{if(e.target.id!=='accountForm')return;e.preventDefault();const data=Object.fromEntries(new FormData(e.target));data.assessed=Number(data.assessed);data.paid=Number(data.paid);data.status=data.paid>=data.assessed?'Paid':data.paid===0?'Overdue':'Partial';const backdrop=document.querySelector('#modalBackdrop'),idx=backdrop.dataset.index; if(idx==='')accounts.unshift(data);else accounts[Number(idx)]={...accounts[Number(idx)],...data};backdrop.remove();currentPage=1;render();notify(idx===''?'Assessment added successfully.':'Assessment updated successfully.')});
document.querySelector('#menuToggle').addEventListener('click',()=>{appShell.classList.toggle('nav-closed');document.querySelector('#menuToggle').setAttribute('aria-expanded',String(!appShell.classList.contains('nav-closed')))});
document.querySelector('#accountButton').addEventListener('click',e=>{e.stopPropagation();document.querySelector('#accountMenu').classList.toggle('open')});
document.querySelector('#accountMenu').addEventListener('click',e=>{const button=e.target.closest('[data-role]');if(!button)return;role=button.dataset.role;currentView=role==='admin'?'assessments':'my-assessment';currentPage=1;document.querySelector('#accountMenu').classList.remove('open');history.replaceState(null,'',`#${currentView}`);render();notify(`Switched to ${role==='admin'?'Administrator':'Student'} view.`)});
document.addEventListener('click',e=>{if(!e.target.closest('.account-wrap'))document.querySelector('#accountMenu').classList.remove('open')});
document.querySelector('#logoutButton').addEventListener('click',()=>{document.querySelector('#accountMenu').classList.remove('open');notify('You have been logged out.')});
document.querySelector('#logoutTop').addEventListener('click',()=>notify('You have been logged out.'));
window.addEventListener('hashchange',()=>{currentView=location.hash.slice(1)||(role==='admin'?'assessments':'my-assessment');currentPage=1;render()});
render();
