document.addEventListener('DOMContentLoaded', () => {
  const portalApp = document.querySelector('#portalApp');
  const loginScreen = document.querySelector('#loginScreen');
  const loginForm = document.querySelector('#loginForm');
  const loginRole = document.querySelector('#loginRole');
  const loginIdentifier = document.querySelector('#loginIdentifier');
  const loginPassword = document.querySelector('#loginPassword');
  const loginIdLabel = document.querySelector('#loginIdLabel');
  const main = document.querySelector('#mainContent');
  const navigation = document.querySelector('.navigation');
  const roleButton = document.querySelector('#roleButton');
  const roleMenu = document.querySelector('#roleMenu');
  const roleLabel = document.querySelector('#roleLabel');
  const toast = document.querySelector('#toast');

  let role = 'student';
  let section = 'tuition-assessment';
  let panel = 'my-assessment';
  let page = 1;
  let toastTimer;
  let signedOut = false;
  let profileName = 'Gemar Enopia';

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
  const getStudent = () => accounts.find(account => account.id === studentId);
  const feeTotal = () => fees.reduce((sum, fee) => sum + Number(fee.amount), 0);
  const balance = account => Math.max(0, Number(account.assessed) - Number(account.paid));
  const money = value => `₱ ${Number(value).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

  function notify(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
  }

  function setHash() {
    const value = section === 'tuition-assessment' ? `tuition-assessment/${panel}` : section;
    if (location.hash.slice(1) !== value) history.pushState(null, '', `#${value}`);
  }

  function moduleTabs() {
    const items = role === 'admin'
      ? [['assessments', 'Student Assessments'], ['payments', 'Payment Records'], ['fee-structure', 'Fee Structure']]
      : [['my-assessment', 'My Assessment'], ['fee-breakdown', 'Fee Breakdown'], ['payment-history', 'Payment History']];
    return `<div class="module-tabs" aria-label="Tuition Assessment pages">${items.map(([key, label]) => `<button type="button" class="module-tab ${panel === key ? 'active' : ''}" data-panel="${key}">${label}</button>`).join('')}</div>`;
  }

  function pageHeader(title, description, action = '') {
    return `<div class="module-head"><div><div class="module-eyebrow">${role === 'admin' ? 'Administrator' : 'Student'} / Tuition Assessment</div><h2>${title}</h2><p>${description}</p></div>${action}</div>`;
  }

  function statusBadge(value) {
    const text = String(value).toLowerCase();
    const kind = text === 'paid' || text === 'posted' ? '' : text === 'overdue' ? 'overdue' : 'partial';
    return `<span class="module-status ${kind}">${escapeHTML(value)}</span>`;
  }

  function statCards(items) {
    return `<div class="module-stats">${items.map(([icon, value, label]) => `<div class="module-stat"><div class="module-stat-icon">${icon}</div><div class="module-stat-value">${value}</div><div class="module-stat-label">${label}</div></div>`).join('')}</div>`;
  }

  function adminAssessments() {
    const paid = accounts.filter(account => balance(account) === 0).length;
    const overdue = accounts.filter(account => account.status === 'Overdue' && balance(account) > 0).length;
    const partial = accounts.length - paid - overdue;
    const dueTotal = accounts.reduce((sum, account) => sum + balance(account), 0);
    return `${pageHeader('Student Assessments', 'Review student tuition assessments, balances, and account standing.', '<button type="button" class="module-primary" data-action="add-assessment">＋ Add Assessment</button>')}
      ${statCards([['♙', String(accounts.length).padStart(3, '0'), 'Student Accounts'], ['✓', String(paid).padStart(3, '0'), 'Paid in Full'], ['◷', String(partial).padStart(3, '0'), 'Partial Balance'], ['⚑', String(overdue).padStart(3, '0'), 'Overdue']])}
      <div class="module-toolbar"><label class="module-search"><span>⌕</span><input id="accountSearch" type="search" placeholder="Search student name / ID" aria-label="Search student accounts"></label><select id="statusFilter" aria-label="Filter status"><option value="all">All Statuses</option><option>Paid</option><option>Partial</option><option>Overdue</option></select><select id="yearFilter" aria-label="Filter year level"><option value="all">All Year Levels</option><option>1st Year</option><option>2nd Year</option><option>3rd Year</option><option>4th Year</option></select></div>
      <div class="module-table-wrap"><table class="module-table"><thead><tr><th>Student</th><th>ID Number</th><th>Program</th><th>Year</th><th>Assessed</th><th>Paid</th><th>Balance</th><th>Status</th><th>Action</th></tr></thead><tbody id="accountRows"></tbody></table></div>
      <div class="module-summary"><span id="accountCount"></span><span>Outstanding balance: <strong>${money(dueTotal)}</strong></span><div class="module-pagination" id="accountPager"></div></div>`;
  }

  function adminPayments() {
    const sum = payments.reduce((total, payment) => total + Number(payment.amount), 0);
    return `${pageHeader('Payment Records', 'Review and export tuition payments received from students.', '<button type="button" class="module-primary" data-action="export-payments">⇩ Export CSV</button>')}
      ${statCards([['₱', money(sum), 'Payments Posted'], ['▤', String(payments.length).padStart(3, '0'), 'Transactions'], ['✓', '100%', 'Reconciled'], ['◷', 'Today', 'Last Updated']])}
      <div class="module-toolbar"><label class="module-search"><span>⌕</span><input id="paymentSearch" type="search" placeholder="Search name, ID, or reference" aria-label="Search payment records"></label></div>
      <div class="module-table-wrap"><table class="module-table"><thead><tr><th>Date</th><th>Student</th><th>ID Number</th><th>Reference</th><th>Method</th><th>Amount</th><th>Status</th><th>Action</th></tr></thead><tbody id="paymentRows"></tbody></table></div>
      <div class="module-summary"><span id="paymentCount"></span><div class="module-pagination" id="paymentPager"></div></div>`;
  }

  function adminFees() {
    return `${pageHeader('Fee Structure', 'Current tuition and fees for Academic Year 2026–2027.', '<button type="button" class="module-primary" data-action="edit-fees">✎ Edit Fee Structure</button>')}
      <div class="module-grid"><div class="module-info-card"><h3>Program</h3><p>Bachelor of Science in Information Technology</p></div><div class="module-info-card"><h3>Academic Year</h3><p>2026–2027 · First Semester</p></div><div class="module-info-card"><h3>Total per Student</h3><div class="module-amount">${money(feeTotal())}</div></div></div>
      <div class="module-info-lines"><h3>Assessment Components</h3>${fees.map(fee => `<div class="module-info-line"><span>${escapeHTML(fee.label)}</span><strong>${money(fee.amount)}</strong></div>`).join('')}<div class="module-info-line"><strong>Total Assessment</strong><strong>${money(feeTotal())}</strong></div></div>`;
  }

  function studentAssessment() {
    const account = getStudent();
    const due = balance(account);
    return `${pageHeader('My Tuition Assessment', 'Review your current semester assessment and account balance.', '<button type="button" class="module-secondary" data-action="download-assessment">⇩ Download Assessment</button>')}
      <div class="module-grid"><div class="module-info-card"><h3>Academic Year</h3><p>2026–2027 · First Semester</p></div><div class="module-info-card"><h3>Total Assessment</h3><div class="module-amount">${money(account.assessed)}</div></div><div class="module-info-card"><h3>Account Status</h3><p>${statusBadge(due === 0 ? 'Paid' : account.status)}</p></div></div>
      <div class="module-payment-banner"><div><h3>Outstanding Balance</h3><div class="module-amount">${money(due)}</div><p>${due ? 'Next installment due October 20, 2026' : 'No outstanding payment'}</p></div><button type="button" class="module-primary" data-action="record-payment" ${due === 0 ? 'disabled' : ''}>Payment Options</button></div>
      <div class="module-grid"><div class="module-info-lines"><h3>Assessment Breakdown</h3>${fees.map(fee => `<div class="module-info-line"><span>${escapeHTML(fee.label)}</span><strong>${money(fee.amount)}</strong></div>`).join('')}<div class="module-info-line"><strong>Total assessed</strong><strong>${money(account.assessed)}</strong></div></div><div class="module-info-lines"><h3>Installment Summary</h3>${[['Payments received', money(account.paid)], ['Balance due', money(due)], ['Student ID', account.id]].map(([label, value]) => `<div class="module-info-line"><span>${label}</span><strong>${value}</strong></div>`).join('')}<button type="button" class="module-link" data-panel="payment-history">View payment history →</button></div></div>`;
  }

  function studentFees() {
    const account = getStudent();
    return `${pageHeader('Fee Breakdown', 'See the fees included in your current tuition assessment.')}<div class="module-info-lines"><h3>First Semester · Academic Year 2026–2027</h3>${fees.map(fee => `<div class="module-info-line"><span>${escapeHTML(fee.label)}</span><strong>${money(fee.amount)}</strong></div>`).join('')}<div class="module-info-line"><strong>Total Assessment</strong><strong>${money(account.assessed)}</strong></div></div>`;
  }

  function studentHistory() {
    const rows = payments.filter(payment => payment.id === studentId).sort((a, b) => b.date.localeCompare(a.date));
    return `${pageHeader('Payment History', 'Review payments posted to your student account.')}<div class="module-table-wrap"><table class="module-table"><thead><tr><th>Date</th><th>Reference</th><th>Payment Method</th><th>Amount</th><th>Status</th></tr></thead><tbody>${rows.length ? rows.map(payment => `<tr><td>${payment.date}</td><td>${escapeHTML(payment.ref)}</td><td>${escapeHTML(payment.method)}</td><td class="money-cell">${money(payment.amount)}</td><td>${statusBadge(payment.status)}</td></tr>`).join('') : '<tr><td colspan="5" class="module-empty">No payments have been posted yet.</td></tr>'}</tbody></table></div>`;
  }

  function render() {
    portalApp.hidden = signedOut;
    loginScreen.hidden = !signedOut;
    roleLabel.textContent = role === 'admin' ? 'Administrator' : 'Student';
    document.querySelector('#profileName').textContent = profileName;
    const validPanels = role === 'admin' ? ['assessments', 'payments', 'fee-structure'] : ['my-assessment', 'fee-breakdown', 'payment-history'];
    if (!validPanels.includes(panel)) panel = validPanels[0];
    navigation.querySelectorAll('[data-section]').forEach(link => link.classList.toggle('active', link.dataset.section === section));
    if (signedOut) return;
    if (section !== 'tuition-assessment') {
      main.innerHTML = '';
      return;
    }
    let view;
    if (role === 'admin') view = panel === 'payments' ? adminPayments() : panel === 'fee-structure' ? adminFees() : adminAssessments();
    else view = panel === 'fee-breakdown' ? studentFees() : panel === 'payment-history' ? studentHistory() : studentAssessment();
    main.innerHTML = `<section class="module-card">${moduleTabs()}${view}</section>`;
    renderTables();
  }

  function renderPager(target, total) {
    const pages = Math.max(1, Math.ceil(total / 5));
    page = Math.min(page, pages);
    target.innerHTML = `<button type="button" data-page="${page - 1}" ${page === 1 ? 'disabled' : ''}>‹</button>${Array.from({ length: pages }, (_, index) => `<button type="button" data-page="${index + 1}" class="${page === index + 1 ? 'active' : ''}">${index + 1}</button>`).join('')}<button type="button" data-page="${page + 1}" ${page === pages ? 'disabled' : ''}>›</button>`;
  }

  function renderTables() {
    if (role === 'admin' && panel === 'assessments') renderAccountTable();
    if (role === 'admin' && panel === 'payments') renderPaymentTable();
  }

  function renderAccountTable() {
    const body = document.querySelector('#accountRows');
    if (!body) return;
    const query = (document.querySelector('#accountSearch').value || '').toLowerCase().trim();
    const selectedStatus = document.querySelector('#statusFilter').value;
    const selectedYear = document.querySelector('#yearFilter').value;
    const rows = accounts.map((account, index) => ({ ...account, _index: index })).filter(account => {
      const match = `${account.name} ${account.id} ${account.program}`.toLowerCase().includes(query);
      const state = balance(account) === 0 ? 'Paid' : account.status;
      return match && (selectedStatus === 'all' || state === selectedStatus) && (selectedYear === 'all' || account.year === selectedYear);
    });
    page = Math.min(page, Math.max(1, Math.ceil(rows.length / 5)));
    body.innerHTML = rows.slice((page - 1) * 5, page * 5).map(account => `<tr><td>${escapeHTML(account.name)}</td><td>${escapeHTML(account.id)}</td><td>${escapeHTML(account.program)}</td><td>${escapeHTML(account.year)}</td><td>${money(account.assessed)}</td><td>${money(account.paid)}</td><td class="money-cell">${money(balance(account))}</td><td>${statusBadge(balance(account) === 0 ? 'Paid' : account.status)}</td><td><button type="button" class="row-action" data-edit-account="${account._index}">View / Edit</button></td></tr>`).join('') || '<tr><td colspan="9" class="module-empty">No student accounts match these filters.</td></tr>';
    document.querySelector('#accountCount').textContent = `Showing ${rows.length ? (page - 1) * 5 + 1 : 0}–${Math.min(page * 5, rows.length)} of ${rows.length} records`;
    renderPager(document.querySelector('#accountPager'), rows.length);
  }

  function renderPaymentTable() {
    const body = document.querySelector('#paymentRows');
    if (!body) return;
    const query = (document.querySelector('#paymentSearch').value || '').toLowerCase().trim();
    const rows = payments.map((payment, index) => ({ ...payment, _index: index })).filter(payment => `${payment.student} ${payment.id} ${payment.ref} ${payment.method}`.toLowerCase().includes(query));
    page = Math.min(page, Math.max(1, Math.ceil(rows.length / 5)));
    body.innerHTML = rows.slice((page - 1) * 5, page * 5).map(payment => `<tr><td>${escapeHTML(payment.date)}</td><td>${escapeHTML(payment.student)}</td><td>${escapeHTML(payment.id)}</td><td>${escapeHTML(payment.ref)}</td><td>${escapeHTML(payment.method)}</td><td class="money-cell">${money(payment.amount)}</td><td>${statusBadge(payment.status)}</td><td><button type="button" class="row-action" data-view-payment="${payment._index}">View</button></td></tr>`).join('') || '<tr><td colspan="8" class="module-empty">No payments match your search.</td></tr>';
    document.querySelector('#paymentCount').textContent = `Showing ${rows.length ? (page - 1) * 5 + 1 : 0}–${Math.min(page * 5, rows.length)} of ${rows.length} records`;
    renderPager(document.querySelector('#paymentPager'), rows.length);
  }

  function showModal(title, fields, submitText = 'Save') {
    closeModal();
    const backdrop = document.createElement('div');
    backdrop.className = 'module-modal-backdrop';
    backdrop.id = 'moduleModal';
    backdrop.innerHTML = `<form class="module-modal" id="moduleForm"><h2>${title}</h2>${fields}<div class="module-modal-actions"><button type="button" class="module-secondary" data-close-modal>Cancel</button><button type="submit" class="module-primary">${submitText}</button></div></form>`;
    document.body.append(backdrop);
    backdrop.querySelector('input:not([type=hidden]),select')?.focus();
  }

  function closeModal() { document.querySelector('#moduleModal')?.remove(); }

  function accountForm(index = null) {
    const item = index === null ? { name: '', id: '', program: 'Bachelor of Science in Information Technology', year: '1st Year', assessed: feeTotal(), paid: 0 } : accounts[index];
    const fields = `<input type="hidden" name="kind" value="account"><input type="hidden" name="index" value="${index === null ? '' : index}"><div class="module-form-grid">
      <div class="module-field"><label for="studentName">Student name</label><input id="studentName" name="name" value="${escapeHTML(item.name)}" required></div>
      <div class="module-field"><label for="studentId">ID number</label><input id="studentId" name="id" value="${escapeHTML(item.id)}" required></div>
      <div class="module-field full"><label for="studentProgram">Program</label><input id="studentProgram" name="program" value="${escapeHTML(item.program)}" required></div>
      <div class="module-field"><label for="studentYear">Year level</label><select id="studentYear" name="year">${['1st Year', '2nd Year', '3rd Year', '4th Year'].map(year => `<option ${item.year === year ? 'selected' : ''}>${year}</option>`).join('')}</select></div>
      <div class="module-field"><label for="studentAssessed">Assessment total (₱)</label><input id="studentAssessed" name="assessed" type="number" min="0" step="0.01" value="${item.assessed}" required></div>
      <div class="module-field"><label for="studentPaid">Paid to date (₱)</label><input id="studentPaid" name="paid" type="number" min="0" max="${item.assessed}" step="0.01" value="${item.paid}" required></div>
    </div>`;
    showModal(index === null ? 'Add Student Assessment' : 'Edit Student Assessment', fields, 'Save Assessment');
  }

  function feeForm() {
    const fields = `<input type="hidden" name="kind" value="fees"><div class="module-form-grid">${fees.map((fee, index) => `<div class="module-field full"><label for="fee${index}">${escapeHTML(fee.label)} (₱)</label><input id="fee${index}" name="fee${index}" type="number" min="0" step="0.01" value="${fee.amount}" required></div>`).join('')}</div><p class="module-eyebrow">Saving applies this structure to all student assessments.</p>`;
    showModal('Edit Fee Structure', fields, 'Save Fees');
  }

  function paymentForm() {
    const due = balance(getStudent());
    const fields = `<input type="hidden" name="kind" value="payment"><div class="module-info-line"><span>Outstanding balance</span><strong>${money(due)}</strong></div><div class="module-field" style="margin-top:12px"><label for="payAmount">Payment amount (₱)</label><input id="payAmount" name="amount" type="number" min="0.01" max="${due}" step="0.01" value="${due}" required></div><div class="module-field" style="margin-top:12px"><label for="payMethod">Payment method</label><select id="payMethod" name="method"><option>Cashier</option><option>Bank transfer</option><option>Online</option></select></div><p class="module-eyebrow" style="margin-top:12px">Demo only. This records a local sample payment and does not charge an account.</p>`;
    showModal('Payment Options', fields, 'Record Demo Payment');
  }

  function paymentDetails(payment) {
    const fields = `<div class="module-info-line"><span>Student</span><strong>${escapeHTML(payment.student)}</strong></div><div class="module-info-line"><span>Student ID</span><strong>${escapeHTML(payment.id)}</strong></div><div class="module-info-line"><span>Reference</span><strong>${escapeHTML(payment.ref)}</strong></div><div class="module-info-line"><span>Date / Method</span><strong>${escapeHTML(payment.date)} · ${escapeHTML(payment.method)}</strong></div><div class="module-info-line"><span>Amount / Status</span><strong>${money(payment.amount)} · ${escapeHTML(payment.status)}</strong></div>`;
    showModal('Payment Details', fields, 'Done');
  }

  function downloadFile(filename, text, type) {
    const url = URL.createObjectURL(new Blob([text], { type }));
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function downloadStatement() {
    const account = getStudent();
    const lines = fees.map(fee => `<tr><td>${escapeHTML(fee.label)}</td><td>${money(fee.amount)}</td></tr>`).join('');
    const statement = `<!doctype html><html><head><meta charset="utf-8"><title>Tuition Assessment</title><style>body{font:16px Arial;max-width:720px;margin:40px auto;color:#1c2948}table{width:100%;border-collapse:collapse}td,th{padding:12px;border-bottom:1px solid #ddd;text-align:left}</style></head><body><h1>Cebu Eastern College</h1><h2>Tuition Assessment</h2><p>${escapeHTML(account.name)} · ${account.id} · Academic Year 2026–2027</p><table>${lines}<tr><th>Total assessed</th><th>${money(account.assessed)}</th></tr><tr><td>Payments received</td><td>${money(account.paid)}</td></tr><tr><th>Balance due</th><th>${money(balance(account))}</th></tr></table></body></html>`;
    downloadFile('tuition_assessment_statement.html', statement, 'text/html;charset=utf-8');
    notify('Assessment statement downloaded.');
  }

  function exportPayments() {
    const quote = value => `"${String(value).replaceAll('"', '""')}"`;
    const data = [['Date', 'Student', 'ID Number', 'Reference', 'Method', 'Amount', 'Status'], ...payments.map(payment => [payment.date, payment.student, payment.id, payment.ref, payment.method, Number(payment.amount).toFixed(2), payment.status])];
    downloadFile('tuition_assessment_payments.csv', data.map(row => row.map(quote).join(',')).join('\n'), 'text/csv;charset=utf-8');
    notify('Payment records exported as CSV.');
  }

  function addDemoPayment(amount, method) {
    const account = getStudent();
    const now = new Date();
    const date = `${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}/${now.getFullYear()}`;
    const reference = `CEC-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${Date.now().toString().slice(-4)}`;
    account.paid = Math.min(account.assessed, Number(account.paid) + amount);
    account.status = balance(account) === 0 ? 'Paid' : 'Partial';
    payments.unshift({ date, student: account.name, id: account.id, ref: reference, method, amount, status: 'Posted' });
  }

  function formSubmit(form) {
    const data = Object.fromEntries(new FormData(form));
    if (data.kind === 'account') {
      const assessed = Number(data.assessed);
      const paid = Number(data.paid);
      if (paid > assessed) { notify('Paid amount cannot exceed the assessment total.'); return; }
      const record = { name: data.name.trim(), id: data.id.trim(), program: data.program.trim(), year: data.year, assessed, paid, status: paid === 0 ? 'Overdue' : paid >= assessed ? 'Paid' : 'Partial' };
      if (data.index === '') accounts.unshift(record);
      else accounts[Number(data.index)] = { ...accounts[Number(data.index)], ...record };
      closeModal(); page = 1; render(); notify(data.index === '' ? 'Assessment added.' : 'Assessment updated.');
    } else if (data.kind === 'fees') {
      fees = fees.map((fee, index) => ({ ...fee, amount: Number(data[`fee${index}`]) }));
      accounts.forEach(account => { account.assessed = feeTotal(); account.status = account.paid >= account.assessed ? 'Paid' : account.paid === 0 ? 'Overdue' : 'Partial'; });
      closeModal(); render(); notify('Fee structure and assessments updated.');
    } else if (data.kind === 'payment') {
      const amount = Number(data.amount);
      if (!(amount > 0) || amount > balance(getStudent())) { notify('Enter an amount up to the outstanding balance.'); return; }
      addDemoPayment(amount, data.method);
      closeModal(); panel = 'my-assessment'; page = 1; render(); notify('Demo payment recorded.');
    } else closeModal();
  }

  navigation.addEventListener('click', event => {
    const link = event.target.closest('[data-section]');
    if (!link) return;
    event.preventDefault();
    section = link.dataset.section;
    page = 1;
    setHash();
    render();
  });

  main.addEventListener('click', event => {
    const tab = event.target.closest('[data-panel]');
    if (tab) { panel = tab.dataset.panel; page = 1; setHash(); render(); return; }
    const pageButton = event.target.closest('[data-page]');
    if (pageButton && !pageButton.disabled) { page = Number(pageButton.dataset.page); renderTables(); return; }
    const accountButton = event.target.closest('[data-edit-account]');
    if (accountButton) { accountForm(Number(accountButton.dataset.editAccount)); return; }
    const paymentButton = event.target.closest('[data-view-payment]');
    if (paymentButton) { paymentDetails(payments[Number(paymentButton.dataset.viewPayment)]); return; }
    const action = event.target.closest('[data-action]')?.dataset.action;
    if (action === 'add-assessment') accountForm();
    else if (action === 'edit-fees') feeForm();
    else if (action === 'record-payment') paymentForm();
    else if (action === 'download-assessment') downloadStatement();
    else if (action === 'export-payments') exportPayments();
  });

  main.addEventListener('input', event => {
    if (event.target.matches('#accountSearch, #paymentSearch')) { page = 1; renderTables(); }
    if (event.target.id === 'studentAssessed') {
      const paid = document.querySelector('#studentPaid');
      if (paid) paid.max = event.target.value;
    }
  });

  main.addEventListener('change', event => {
    if (event.target.matches('#statusFilter, #yearFilter')) { page = 1; renderAccountTable(); }
  });

  document.body.addEventListener('click', event => {
    if (event.target.matches('[data-close-modal]') || event.target.id === 'moduleModal') closeModal();
  });

  document.body.addEventListener('submit', event => {
    if (event.target.id !== 'moduleForm') return;
    event.preventDefault();
    formSubmit(event.target);
  });

  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeModal(); });

  roleButton.addEventListener('click', event => {
    event.stopPropagation();
    roleMenu.hidden = !roleMenu.hidden;
    roleButton.setAttribute('aria-expanded', String(!roleMenu.hidden));
  });

  roleMenu.addEventListener('click', event => {
    const button = event.target.closest('[data-role]');
    if (!button) return;
    role = button.dataset.role;
    panel = role === 'admin' ? 'assessments' : 'my-assessment';
    profileName = role === 'admin' ? 'Administrator' : 'Gemar Enopia';
    signedOut = false;
    roleMenu.hidden = true;
    roleButton.setAttribute('aria-expanded', 'false');
    page = 1;
    setHash();
    render();
    notify(`Switched to ${role === 'admin' ? 'Administrator' : 'Student'} view.`);
  });

  document.addEventListener('click', event => {
    if (!event.target.closest('.student-profile')) {
      roleMenu.hidden = true;
      roleButton.setAttribute('aria-expanded', 'false');
    }
  });

  document.querySelector('#logoutButton').addEventListener('click', () => {
    signedOut = true;
    roleMenu.hidden = true;
    roleButton.setAttribute('aria-expanded', 'false');
    render();
    loginRole.value = role;
    loginRole.dispatchEvent(new Event('change'));
    loginIdentifier.value = '';
    loginPassword.value = '';
    try {
      const remembered = localStorage.getItem('cecRememberIdentifier');
      if (remembered) {
        loginIdentifier.value = remembered;
        document.querySelector('#rememberLogin').checked = true;
      }
    } catch (_) { /* Storage may be unavailable for local-file previews. */ }
    loginIdentifier.focus();
    notify('You have been logged out.');
  });

  loginRole.addEventListener('change', () => {
    const isAdmin = loginRole.value === 'admin';
    loginIdLabel.textContent = isAdmin ? 'Administrator ID or email' : 'Student ID or email';
    loginIdentifier.placeholder = isAdmin ? 'Enter your administrator ID or email' : 'Enter your student ID or email';
  });

  document.querySelector('#togglePassword').addEventListener('click', event => {
    const button = event.currentTarget;
    const show = loginPassword.type === 'password';
    loginPassword.type = show ? 'text' : 'password';
    button.textContent = show ? 'Hide' : 'Show';
    button.setAttribute('aria-pressed', String(show));
  });

  document.querySelector('#forgotPassword').addEventListener('click', () => {
    notify('For this demo, contact the school to reset your account password.');
  });

  loginForm.addEventListener('submit', event => {
    event.preventDefault();
    if (!loginForm.reportValidity()) return;
    const identifier = loginIdentifier.value.trim();
    if (!identifier || !loginPassword.value) return;
    role = loginRole.value;
    profileName = role === 'admin' ? 'Administrator' : identifier === studentId ? 'Gemar Enopia' : identifier;
    panel = role === 'admin' ? 'assessments' : 'my-assessment';
    section = 'tuition-assessment';
    page = 1;
    signedOut = false;
    const remember = document.querySelector('#rememberLogin').checked;
    try {
      if (remember) localStorage.setItem('cecRememberIdentifier', identifier);
      else localStorage.removeItem('cecRememberIdentifier');
    } catch (_) { /* Storage may be unavailable for local-file previews. */ }
    loginPassword.value = '';
    loginPassword.type = 'password';
    document.querySelector('#togglePassword').textContent = 'Show';
    document.querySelector('#togglePassword').setAttribute('aria-pressed', 'false');
    setHash();
    render();
    notify(`Signed in to the ${role === 'admin' ? 'Administrator' : 'Student'} view.`);
  });

  window.addEventListener('hashchange', () => {
    const hash = location.hash.slice(1);
    const [nextSection, nextPanel] = hash.split('/');
    const validSections = ['dashboard', 'announcements', 'schedule', 'grades', 'tuition-assessment', 'profile', 'settings'];
    if (!validSections.includes(nextSection)) return;
    section = nextSection;
    if (nextSection === 'tuition-assessment' && nextPanel) panel = nextPanel;
    page = 1;
    render();
  });

  const initialHash = location.hash.slice(1).split('/');
  const allowedSections = ['dashboard', 'announcements', 'schedule', 'grades', 'tuition-assessment', 'profile', 'settings'];
  if (allowedSections.includes(initialHash[0])) section = initialHash[0];
  if (section === 'tuition-assessment' && initialHash[1]) panel = initialHash[1];
  render();
});
