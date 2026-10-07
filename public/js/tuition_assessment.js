const content = document.querySelector('#contentArea');
const nav = document.querySelector('#sideNav');
const appShell = document.querySelector('.app-shell');
const toast = document.querySelector('#toast');
const accountMenu = document.querySelector('#accountMenu');
const accountButton = document.querySelector('#accountButton');

let role = 'admin';
let currentView = location.hash.slice(1) || 'assessments';
let currentPage = 1;
let signedOut = false;
let toastTimer;

let fees = [
  { label: 'Tuition fee', amount: 20000 },
  { label: 'Laboratory & technology', amount: 4250 },
  { label: 'Miscellaneous fees', amount: 4200 }
];

let accounts = [
  { name: 'Gemar Enopia', id: '2026-010', program: 'BS Information Technology', year: '3rd Year', assessed: 28450, paid: 20000, status: 'Partial' },
  { name: 'Rhea Lyn Polosan', id: '2026-011', program: 'BS Information Technology', year: '3rd Year', assessed: 28450, paid: 28450, status: 'Paid' },
  { name: 'Joshryl Matugas', id: '2026-012', program: 'BS Information Technology', year: '3rd Year', assessed: 28450, paid: 15000, status: 'Partial' },
  { name: 'Mikaela Santos', id: '2026-013', program: 'BS Information Technology', year: '3rd Year', assessed: 28450, paid: 28450, status: 'Paid' },
  { name: 'Daniel Cruz', id: '2026-014', program: 'BS Information Technology', year: '3rd Year', assessed: 28450, paid: 10000, status: 'Overdue' },
  { name: 'Alyssa Reyes', id: '2026-015', program: 'BS Information Technology', year: '3rd Year', assessed: 28450, paid: 20000, status: 'Partial' },
  { name: 'Paolo Mendoza', id: '2026-016', program: 'BS Information Technology', year: '3rd Year', assessed: 28450, paid: 28450, status: 'Paid' }
];

let payments = [
  { date: '09/20/2026', student: 'Gemar Enopia', id: '2026-010', ref: 'CEC-260920-0101', method: 'Bank transfer', amount: 10000, status: 'Posted' },
  { date: '09/18/2026', student: 'Rhea Lyn Polosan', id: '2026-011', ref: 'CEC-260918-0114', method: 'Cashier', amount: 9500, status: 'Posted' },
  { date: '09/15/2026', student: 'Joshryl Matugas', id: '2026-012', ref: 'CEC-260915-0122', method: 'Online', amount: 5000, status: 'Posted' },
  { date: '09/12/2026', student: 'Mikaela Santos', id: '2026-013', ref: 'CEC-260912-0133', method: 'Cashier', amount: 10000, status: 'Posted' },
  { date: '09/10/2026', student: 'Daniel Cruz', id: '2026-014', ref: 'CEC-260910-0140', method: 'Bank transfer', amount: 10000, status: 'Posted' }
];

const studentId = '2026-010';
const studentAccount = () => accounts.find(account => account.id === studentId);
const feeTotal = () => fees.reduce((sum, fee) => sum + Number(fee.amount), 0);
const balanceFor = account => Math.max(0, Number(account.assessed) - Number(account.paid));
const money = value => `₱ ${Number(value).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

function notify(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}

function navItems() {
  return role === 'admin'
    ? [['assessments', '▣', 'Student Assessments'], ['payments', '▤', 'Payment Records'], ['fee-structure', '▦', 'Fee Structure']]
    : [['my-assessment', '▣', 'My Assessment'], ['fee-breakdown', '▤', 'Fee Breakdown'], ['payment-history', '▦', 'Payment History']];
}

function breadcrumb(label) {
  return `<p class="breadcrumb">${role === 'admin' ? 'Admin' : 'Student'} / Tuition &amp; Assessment / ${label}</p>`;
}

function pageHead(title, description, action = '') {
  return `<div class="page-head"><div>${breadcrumb(title)}<h1 class="page-title">${title}</h1><p class="page-desc">${description}</p></div>${action}</div>`;
}

function stats(items) {
  return `<div class="stats-grid">${items.map(([icon, value, label], index) => `<div class="stat-card ${index === 0 ? 'selected' : ''}"><div class="stat-icon">${icon}</div><div class="stat-value">${value}</div><div class="stat-label">${label}</div></div>`).join('')}</div>`;
}

function badge(label) {
  const text = String(label).toLowerCase();
  const className = ['paid', 'posted'].includes(text) ? 'current' : text === 'overdue' ? 'flagged' : 'updated';
  return `<span class="status ${className}">${escapeHTML(label)}</span>`;
}

function searchBar(placeholder = 'Search student name / ID') {
  return `<div class="toolbar"><label class="search-box"><span>⌕</span><input id="tableSearch" placeholder="${placeholder}" aria-label="${placeholder}"></label></div>`;
}

function pager() {
  return `<div class="table-footer"><span id="resultCount"></span><div class="pagination" id="pagination"></div></div>`;
}

function adminAssessments() {
  const paidCount = accounts.filter(account => balanceFor(account) === 0).length;
  const overdueCount = accounts.filter(account => account.status === 'Overdue' && balanceFor(account) > 0).length;
  const partialCount = accounts.length - paidCount - overdueCount;
  const balance = accounts.reduce((sum, account) => sum + balanceFor(account), 0);
  return `${pageHead('Student Assessments', 'Review student tuition assessments, balances, and account standing.', '<button class="primary-button" id="addAssessment">＋ Add Assessment</button>')}
    ${stats([['👥', String(accounts.length).padStart(3, '0'), 'Student Accounts'], ['✓', String(paidCount).padStart(3, '0'), 'Paid in Full'], ['◷', String(partialCount).padStart(3, '0'), 'Partial Balance'], ['⚑', String(overdueCount).padStart(3, '0'), 'Overdue']])}
    ${searchBar()}<div class="toolbar"><select id="accountStatus" aria-label="Filter account status"><option value="all">All Statuses</option><option>Paid</option><option>Partial</option><option>Overdue</option></select><select id="accountYear" aria-label="Filter year"><option value="all">All Year Levels</option><option>1st Year</option><option>2nd Year</option><option>3rd Year</option><option>4th Year</option></select></div>
    <div class="table-wrap"><table><thead><tr><th>Student</th><th>ID Number</th><th>Program</th><th>Year Level</th><th>Assessment</th><th>Paid</th><th>Balance</th><th>Status</th><th>Actions</th></tr></thead><tbody id="tableRows"></tbody></table></div>${pager()}<p class="page-desc">Outstanding balance across accounts: <strong>${money(balance)}</strong></p>`;
}

function adminPayments() {
  const total = payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
  return `${pageHead('Payment Records', 'Review and track tuition payments received from students.', '<button class="primary-button" id="exportPayments">⇩ Export Records</button>')}
    ${stats([['₱', money(total), 'Payments Posted'], ['▤', String(payments.length).padStart(3, '0'), 'Transactions'], ['✓', '100%', 'Reconciled'], ['◷', 'Today', 'Last Updated']])}
    ${searchBar('Search student, ID, or reference')}<div class="table-wrap"><table><thead><tr><th>Date</th><th>Student</th><th>ID Number</th><th>Reference</th><th>Method</th><th>Amount</th><th>Status</th><th>Actions</th></tr></thead><tbody id="tableRows"></tbody></table></div>${pager()}`;
}

function feeStructure() {
  return `${pageHead('Fee Structure', 'Current tuition and fees for Academic Year 2026–2027.', '<button class="primary-button" id="editFees">✎ Edit Fee Structure</button>')}
    <div class="panel-grid"><div class="panel"><div class="stat-icon">📘</div><h3>Program</h3><p>BS Information Technology</p></div><div class="panel"><div class="stat-icon">🏫</div><h3>Academic Year</h3><p>2026–2027 · 1st Semester</p></div><div class="panel"><div class="stat-icon">₱</div><h3>Total per Student</h3><div class="money">${money(feeTotal())}</div></div></div>
    <div class="info-card"><h3>Assessment Components</h3>${fees.map(fee => `<div class="info-line"><span>${escapeHTML(fee.label)}</span><strong>${money(fee.amount)}</strong></div>`).join('')}<div class="info-line"><strong>Total Assessment</strong><strong>${money(feeTotal())}</strong></div></div>`;
}

function studentAssessment() {
  const account = studentAccount();
  const balance = balanceFor(account);
  const history = payments.filter(payment => payment.id === studentId).sort((a, b) => b.date.localeCompare(a.date));
  const nextDue = balance ? 'October 20, 2026' : 'No outstanding payment';
  return `${pageHead('My Tuition Assessment', 'Your current school year assessment and account standing.', '<button class="primary-button" id="downloadAssessment">⇩ Download Assessment</button>')}
    <div class="panel-grid"><div class="panel"><div class="stat-icon">📘</div><h3>Academic Year</h3><p>2026–2027 · 1st Semester</p></div><div class="panel"><div class="stat-icon">💳</div><h3>Total Assessment</h3><div class="money">${money(account.assessed)}</div></div><div class="panel"><div class="stat-icon">✓</div><h3>Account Status</h3><p>${badge(balance ? account.status : 'Paid')}</p></div></div>
    <div class="payment-card"><div><h3 style="font:700 12px Manrope;margin:0 0 5px">Outstanding Balance</h3><div class="money">${money(balance)}</div><p>Next installment due ${nextDue}</p></div><button class="primary-button" id="payNow" ${balance <= 0 ? 'disabled' : ''}>Payment Options</button></div>
    <div class="info-grid"><div class="info-card"><h3>Assessment Breakdown</h3>${fees.map(fee => `<div class="info-line"><span>${escapeHTML(fee.label)}</span><strong>${money(fee.amount)}</strong></div>`).join('')}<div class="info-line"><strong>Total assessed</strong><strong>${money(account.assessed)}</strong></div></div><div class="info-card"><h3>Installment Summary</h3>${[['Total assessment', money(account.assessed)], ['Payments received', money(account.paid)], ['Balance due', money(balance)], ['Next due date', nextDue]].map(([label, value]) => `<div class="info-line"><span>${label}</span><strong>${value}</strong></div>`).join('')}<button class="action-link" data-go="payment-history">View payment history →</button></div></div>`;
}

function studentFees() {
  const account = studentAccount();
  return `${pageHead('Fee Breakdown', 'See the fees included in your current tuition assessment.')}<div class="info-card"><h3>1st Semester · Academic Year 2026–2027</h3>${fees.map(fee => `<div class="info-line"><span>${escapeHTML(fee.label)}</span><strong>${money(fee.amount)}</strong></div>`).join('')}<div class="info-line"><strong>Total assessment</strong><strong>${money(account.assessed)}</strong></div></div>`;
}

function studentHistory() {
  const rows = payments.filter(payment => payment.id === studentId).sort((a, b) => b.date.localeCompare(a.date));
  return `${pageHead('Payment History', 'A record of payments posted to your student account.')}<div class="table-wrap"><table><thead><tr><th>Date</th><th>Reference</th><th>Payment Method</th><th>Amount</th><th>Status</th></tr></thead><tbody>${rows.length ? rows.map(payment => `<tr><td>${payment.date}</td><td>${payment.ref}</td><td>${escapeHTML(payment.method)}</td><td>${money(payment.amount)}</td><td>${badge(payment.status)}</td></tr>`).join('') : '<tr><td class="empty-note" colspan="5">No payments have been posted yet.</td></tr>'}</tbody></table></div>`;
}

function render() {
  if (role === 'admin' && !['assessments', 'payments', 'fee-structure'].includes(currentView)) currentView = 'assessments';
  if (role === 'student' && !['my-assessment', 'fee-breakdown', 'payment-history'].includes(currentView)) currentView = 'my-assessment';
  if (location.hash.slice(1) !== currentView) history.replaceState(null, '', `#${currentView}`);

  nav.innerHTML = signedOut ? '' : navItems().map(([id, icon, label]) => `<a class="nav-link ${currentView === id ? 'active' : ''}" href="#${id}" data-view="${id}"><span class="nav-icon">${icon}</span><span>${label}</span></a>`).join('');
  document.querySelector('#accountRole').textContent = signedOut ? 'Signed out' : role === 'admin' ? 'Administrator' : 'Student';
  document.querySelector('#accountName').textContent = 'Gemar Enopia';

  if (signedOut) {
    content.innerHTML = `<div class="info-card"><h1 class="page-title">You are signed out</h1><p class="page-desc">Your demo session has ended.</p><button class="primary-button" id="signInAgain">Sign in again</button></div>`;
    return;
  }

  if (role === 'admin') content.innerHTML = currentView === 'payments' ? adminPayments() : currentView === 'fee-structure' ? feeStructure() : adminAssessments();
  else content.innerHTML = currentView === 'fee-breakdown' ? studentFees() : currentView === 'payment-history' ? studentHistory() : studentAssessment();
  renderRows();
}

function renderRows() {
  const tbody = document.querySelector('#tableRows');
  if (!tbody) return;
  const query = (document.querySelector('#tableSearch')?.value || '').trim().toLowerCase();
  let rows = [];

  if (currentView === 'payments') {
    rows = payments.map((payment, index) => ({ ...payment, _index: index })).filter(payment => `${payment.student} ${payment.id} ${payment.ref} ${payment.method}`.toLowerCase().includes(query));
    tbody.innerHTML = rows.slice((currentPage - 1) * 5, currentPage * 5).map(payment => `<tr><td>${payment.date}</td><td class="student-name">${escapeHTML(payment.student)}</td><td>${payment.id}</td><td>${payment.ref}</td><td>${escapeHTML(payment.method)}</td><td class="grade">${money(payment.amount)}</td><td>${badge(payment.status)}</td><td><button class="action-link" data-payment="${payment._index}">View</button></td></tr>`).join('') || '<tr><td colspan="8" class="empty-note">No payments found.</td></tr>';
  } else if (currentView === 'assessments') {
    const state = document.querySelector('#accountStatus')?.value || 'all';
    const year = document.querySelector('#accountYear')?.value || 'all';
    rows = accounts.map((account, index) => ({ ...account, _index: index })).filter(account => `${account.name} ${account.id} ${account.program}`.toLowerCase().includes(query) && (state === 'all' || (balanceFor(account) === 0 ? 'Paid' : account.status) === state) && (year === 'all' || account.year === year));
    tbody.innerHTML = rows.slice((currentPage - 1) * 5, currentPage * 5).map(account => `<tr><td class="student-name">${escapeHTML(account.name)}</td><td>${account.id}</td><td>${escapeHTML(account.program)}</td><td>${escapeHTML(account.year)}</td><td>${money(account.assessed)}</td><td>${money(account.paid)}</td><td class="grade">${money(balanceFor(account))}</td><td>${badge(balanceFor(account) ? account.status : 'Paid')}</td><td><button class="action-link" data-account="${account._index}">View / Edit</button></td></tr>`).join('') || '<tr><td colspan="9" class="empty-note">No student accounts match these filters.</td></tr>';
  }

  const count = document.querySelector('#resultCount');
  const pages = Math.max(1, Math.ceil(rows.length / 5));
  currentPage = Math.min(currentPage, pages);
  if (count) count.textContent = `Showing ${rows.length ? (currentPage - 1) * 5 + 1 : 0}–${Math.min(currentPage * 5, rows.length)} of ${rows.length} records`;
  const pagination = document.querySelector('#pagination');
  if (pagination) pagination.innerHTML = `<button data-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''}>‹</button>${Array.from({ length: pages }, (_, index) => `<button data-page="${index + 1}" class="${currentPage === index + 1 ? 'active' : ''}">${index + 1}</button>`).join('')}<button data-page="${currentPage + 1}" ${currentPage === pages ? 'disabled' : ''}>›</button>`;
}

function openModal(title, body, submitLabel = 'Save') {
  document.querySelector('#modalBackdrop')?.remove();
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.id = 'modalBackdrop';
  backdrop.innerHTML = `<form class="modal" id="activeModalForm"><h2>${title}</h2>${body}<div class="modal-actions"><button type="button" class="secondary-button" data-close-modal>Cancel</button><button class="primary-button" type="submit">${submitLabel}</button></div></form>`;
  document.body.append(backdrop);
  backdrop.querySelector('input,select')?.focus();
}

function openAccountModal(index = null) {
  const account = index === null ? { name: '', id: '', program: 'BS Information Technology', year: '1st Year', assessed: feeTotal(), paid: 0 } : accounts[index];
  const body = `<input type="hidden" name="kind" value="account"><input type="hidden" name="index" value="${index === null ? '' : index}"><div class="form-grid">
    <div class="field"><label for="accountNameInput">Student name</label><input id="accountNameInput" name="name" value="${escapeHTML(account.name)}" required></div>
    <div class="field"><label for="accountIdInput">Student ID</label><input id="accountIdInput" name="id" value="${escapeHTML(account.id)}" required></div>
    <div class="field full"><label for="programInput">Program</label><input id="programInput" name="program" value="${escapeHTML(account.program)}" required></div>
    <div class="field"><label for="yearInput">Year level</label><select id="yearInput" name="year">${['1st Year', '2nd Year', '3rd Year', '4th Year'].map(year => `<option ${account.year === year ? 'selected' : ''}>${year}</option>`).join('')}</select></div>
    <div class="field"><label for="assessedInput">Assessment total (₱)</label><input id="assessedInput" name="assessed" type="number" min="0" step="0.01" value="${account.assessed}" required></div>
    <div class="field"><label for="paidInput">Paid to date (₱)</label><input id="paidInput" name="paid" type="number" min="0" max="${account.assessed}" step="0.01" value="${account.paid}" required></div>
  </div>`;
  openModal(index === null ? 'Add Student Assessment' : 'Edit Student Assessment', body, 'Save Assessment');
}

function openFeeModal() {
  const body = `<input type="hidden" name="kind" value="fees"><div class="form-grid">${fees.map((fee, index) => `<div class="field full"><label for="fee${index}">${escapeHTML(fee.label)} (₱)</label><input id="fee${index}" name="fee${index}" type="number" min="0" step="0.01" value="${fee.amount}" required></div>`).join('')}</div><p class="page-desc">Saving updates the fee breakdown and each student assessment.</p>`;
  openModal('Edit Fee Structure', body, 'Save Fees');
}

function openPaymentModal() {
  const account = studentAccount();
  const balance = balanceFor(account);
  const body = `<input type="hidden" name="kind" value="payment"><div class="info-line"><span>Outstanding balance</span><strong>${money(balance)}</strong></div><div class="field"><label for="paymentAmount">Payment amount (₱)</label><input id="paymentAmount" name="amount" type="number" min="0.01" max="${balance}" step="0.01" value="${balance}" required></div><div class="field" style="margin-top:10px"><label for="paymentMethod">Payment method</label><select id="paymentMethod" name="method"><option>Cashier</option><option>Bank transfer</option><option>Online</option></select></div><p class="page-desc">Demo only: this records a sample payment locally and does not charge an account.</p>`;
  openModal('Record Demo Payment', body, 'Record Payment');
}

function openPaymentDetails(payment) {
  const body = `<input type="hidden" name="kind" value="close"><div class="info-line"><span>Student</span><strong>${escapeHTML(payment.student)}</strong></div><div class="info-line"><span>Student ID</span><strong>${payment.id}</strong></div><div class="info-line"><span>Reference</span><strong>${payment.ref}</strong></div><div class="info-line"><span>Date / Method</span><strong>${payment.date} · ${escapeHTML(payment.method)}</strong></div><div class="info-line"><span>Amount / Status</span><strong>${money(payment.amount)} · ${escapeHTML(payment.status)}</strong></div>`;
  openModal('Payment Details', body, 'Done');
}

function downloadFile(filename, contentText, type) {
  const blob = new Blob([contentText], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function downloadAssessment() {
  const account = studentAccount();
  const rows = fees.map(fee => `<tr><td>${escapeHTML(fee.label)}</td><td>${money(fee.amount)}</td></tr>`).join('');
  const documentText = `<!doctype html><html><head><meta charset="utf-8"><title>Tuition Assessment</title><style>body{font:16px Arial;max-width:720px;margin:40px auto;color:#172d58}table{width:100%;border-collapse:collapse}td,th{padding:12px;border-bottom:1px solid #ddd;text-align:left}</style></head><body><h1>Cebu Eastern College</h1><h2>Tuition Assessment</h2><p>${escapeHTML(account.name)} · ${account.id} · Academic Year 2026–2027</p><table><tbody>${rows}<tr><th>Total assessed</th><th>${money(account.assessed)}</th></tr><tr><td>Payments received</td><td>${money(account.paid)}</td></tr><tr><th>Balance due</th><th>${money(balanceFor(account))}</th></tr></tbody></table></body></html>`;
  downloadFile('tuition_assessment_statement.html', documentText, 'text/html;charset=utf-8');
  notify('Assessment statement downloaded.');
}

function exportPayments() {
  const quote = value => `"${String(value).replaceAll('"', '""')}"`;
  const lines = [['Date', 'Student', 'ID Number', 'Reference', 'Method', 'Amount', 'Status'], ...payments.map(payment => [payment.date, payment.student, payment.id, payment.ref, payment.method, payment.amount.toFixed(2), payment.status])];
  downloadFile('tuition_assessment_payments.csv', lines.map(line => line.map(quote).join(',')).join('\n'), 'text/csv;charset=utf-8');
  notify('Payment records exported as CSV.');
}

function logout() {
  signedOut = true;
  accountMenu.classList.remove('open');
  accountButton.setAttribute('aria-expanded', 'false');
  render();
  notify('You have been logged out.');
}

function addPayment(amount, method) {
  const account = studentAccount();
  const paymentDate = new Date();
  const date = `${String(paymentDate.getMonth() + 1).padStart(2, '0')}/${String(paymentDate.getDate()).padStart(2, '0')}/${paymentDate.getFullYear()}`;
  const ref = `CEC-${paymentDate.getFullYear()}${String(paymentDate.getMonth() + 1).padStart(2, '0')}${String(paymentDate.getDate()).padStart(2, '0')}-${Date.now().toString().slice(-4)}`;
  account.paid = Math.min(account.assessed, Number(account.paid) + amount);
  account.status = balanceFor(account) === 0 ? 'Paid' : 'Partial';
  payments.unshift({ date, student: account.name, id: account.id, ref, method, amount, status: 'Posted' });
}

function handleFormSubmit(form) {
  const data = Object.fromEntries(new FormData(form));
  if (data.kind === 'account') {
    const assessed = Number(data.assessed);
    const paid = Number(data.paid);
    if (paid > assessed) { notify('Paid amount cannot exceed the assessment total.'); return; }
    const record = { name: data.name.trim(), id: data.id.trim(), program: data.program.trim(), year: data.year, assessed, paid, status: paid === 0 ? 'Overdue' : paid >= assessed ? 'Paid' : 'Partial' };
    if (data.index === '') accounts.unshift(record);
    else accounts[Number(data.index)] = { ...accounts[Number(data.index)], ...record };
    document.querySelector('#modalBackdrop')?.remove();
    currentPage = 1;
    render();
    notify(data.index === '' ? 'Assessment added successfully.' : 'Assessment updated successfully.');
  } else if (data.kind === 'fees') {
    fees = fees.map((fee, index) => ({ ...fee, amount: Number(data[`fee${index}`]) }));
    accounts.forEach(account => { account.assessed = feeTotal(); account.status = account.paid >= account.assessed ? 'Paid' : account.paid === 0 ? 'Overdue' : 'Partial'; });
    document.querySelector('#modalBackdrop')?.remove();
    render();
    notify('Fee structure and student assessments updated.');
  } else if (data.kind === 'payment') {
    const amount = Number(data.amount);
    const balance = balanceFor(studentAccount());
    if (!(amount > 0) || amount > balance) { notify('Enter a payment amount up to the outstanding balance.'); return; }
    addPayment(amount, data.method);
    document.querySelector('#modalBackdrop')?.remove();
    currentView = 'my-assessment';
    render();
    notify('Demo payment recorded in your account.');
  } else {
    document.querySelector('#modalBackdrop')?.remove();
  }
}

nav.addEventListener('click', event => {
  const link = event.target.closest('[data-view]');
  if (!link) return;
  event.preventDefault();
  currentView = link.dataset.view;
  currentPage = 1;
  history.replaceState(null, '', `#${currentView}`);
  render();
  if (innerWidth < 620) appShell.classList.add('nav-closed');
});

content.addEventListener('click', event => {
  const page = event.target.closest('[data-page]');
  if (page && !page.disabled) { currentPage = Number(page.dataset.page); renderRows(); return; }
  const go = event.target.closest('[data-go]');
  if (go) { currentView = go.dataset.go; currentPage = 1; render(); return; }
  const account = event.target.closest('[data-account]');
  if (account) { openAccountModal(Number(account.dataset.account)); return; }
  const payment = event.target.closest('[data-payment]');
  if (payment) { openPaymentDetails(payments[Number(payment.dataset.payment)]); return; }
  if (event.target.closest('#addAssessment')) { openAccountModal(); return; }
  if (event.target.closest('#editFees')) { openFeeModal(); return; }
  if (event.target.closest('#payNow')) { openPaymentModal(); return; }
  if (event.target.closest('#downloadAssessment')) { downloadAssessment(); return; }
  if (event.target.closest('#exportPayments')) { exportPayments(); return; }
  if (event.target.closest('#logoutButton') || event.target.closest('#logoutTop')) {
    logout();
    return;
  }
  if (event.target.closest('#signInAgain')) { signedOut = false; currentView = role === 'admin' ? 'assessments' : 'my-assessment'; render(); notify('Welcome back.'); }
});

content.addEventListener('input', event => {
  if (event.target.id === 'tableSearch') { currentPage = 1; renderRows(); }
  if (event.target.id === 'assessedInput') {
    const paid = document.querySelector('#paidInput');
    if (paid) paid.max = event.target.value;
  }
});

content.addEventListener('change', event => {
  if (event.target.matches('#accountStatus, #accountYear')) { currentPage = 1; renderRows(); }
});

document.body.addEventListener('click', event => {
  if (event.target.matches('[data-close-modal]') || event.target.id === 'modalBackdrop') document.querySelector('#modalBackdrop')?.remove();
});

document.body.addEventListener('submit', event => {
  if (event.target.id !== 'activeModalForm') return;
  event.preventDefault();
  handleFormSubmit(event.target);
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') document.querySelector('#modalBackdrop')?.remove();
});

document.querySelector('#menuToggle').addEventListener('click', () => {
  appShell.classList.toggle('nav-closed');
  document.querySelector('#menuToggle').setAttribute('aria-expanded', String(!appShell.classList.contains('nav-closed')));
});

accountButton.addEventListener('click', event => {
  event.stopPropagation();
  const open = accountMenu.classList.toggle('open');
  accountButton.setAttribute('aria-expanded', String(open));
});

accountMenu.addEventListener('click', event => {
  const button = event.target.closest('[data-role]');
  if (!button) return;
  role = button.dataset.role;
  signedOut = false;
  currentView = role === 'admin' ? 'assessments' : 'my-assessment';
  currentPage = 1;
  accountMenu.classList.remove('open');
  accountButton.setAttribute('aria-expanded', 'false');
  history.replaceState(null, '', `#${currentView}`);
  render();
  notify(`Switched to ${role === 'admin' ? 'Administrator' : 'Student'} view.`);
});

document.querySelector('#logoutButton').addEventListener('click', logout);
document.querySelector('#logoutTop').addEventListener('click', logout);

document.addEventListener('click', event => {
  if (!event.target.closest('.account-wrap')) {
    accountMenu.classList.remove('open');
    accountButton.setAttribute('aria-expanded', 'false');
  }
});

window.addEventListener('hashchange', () => {
  currentView = location.hash.slice(1) || (role === 'admin' ? 'assessments' : 'my-assessment');
  currentPage = 1;
  render();
});

render();
