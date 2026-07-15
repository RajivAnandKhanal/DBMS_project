// ---------- Elements ----------
const loginView = document.getElementById('login-view');
const dashboardView = document.getElementById('dashboard-view');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');
const currentUserLabel = document.getElementById('current-user');

const studentForm = document.getElementById('student-form');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');
const formError = document.getElementById('form-error');

const studentIdField = document.getElementById('student-id');
const nameField = document.getElementById('name');
const rollNoField = document.getElementById('roll_no');
const departmentField = document.getElementById('department');
const busRouteField = document.getElementById('bus_route');
const feeStatusField = document.getElementById('fee_status');
const phoneField = document.getElementById('phone');
const addressField = document.getElementById('address');

const tbody = document.getElementById('students-tbody');
const emptyState = document.getElementById('empty-state');
const searchInput = document.getElementById('search-input');
const filterFeeStatus = document.getElementById('filter-fee-status');
const refreshBtn = document.getElementById('refresh-btn');

// ---------- View switching ----------
function showDashboard(username) {
  loginView.classList.add('hidden');
  dashboardView.classList.remove('hidden');
  currentUserLabel.textContent = username ? `Signed in as ${username}` : '';
  loadStudents();
}

function showLogin() {
  dashboardView.classList.add('hidden');
  loginView.classList.remove('hidden');
}

// ---------- Auth ----------
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginError.classList.add('hidden');

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  try {
    const data = await api.login(username, password);
    setToken(data.token);
    localStorage.setItem('username', data.user.username);
    showDashboard(data.user.username);
    loginForm.reset();
  } catch (err) {
    loginError.textContent = err.message;
    loginError.classList.remove('hidden');
  }
});

logoutBtn.addEventListener('click', () => {
  setToken(null);
  localStorage.removeItem('username');
  showLogin();
});

// ---------- Student form (add / edit) ----------
function resetForm() {
  studentForm.reset();
  studentIdField.value = '';
  feeStatusField.value = 'unpaid';
  formTitle.textContent = 'Add Student';
  submitBtn.textContent = 'Add Student';
  cancelEditBtn.classList.add('hidden');
  formError.classList.add('hidden');
}

cancelEditBtn.addEventListener('click', resetForm);

function fillFormForEdit(student) {
  studentIdField.value = student.id;
  nameField.value = student.name;
  rollNoField.value = student.roll_no;
  departmentField.value = student.department;
  busRouteField.value = student.bus_route;
  feeStatusField.value = student.fee_status;
  phoneField.value = student.phone || '';
  addressField.value = student.address || '';

  formTitle.textContent = `Edit Student — ${student.name}`;
  submitBtn.textContent = 'Save Changes';
  cancelEditBtn.classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

studentForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  formError.classList.add('hidden');

  const payload = {
    name: nameField.value.trim(),
    roll_no: rollNoField.value.trim(),
    department: departmentField.value.trim(),
    bus_route: busRouteField.value.trim(),
    fee_status: feeStatusField.value,
    phone: phoneField.value.trim() || undefined,
    address: addressField.value.trim() || undefined,
  };

  const id = studentIdField.value;

  try {
    if (id) {
      await api.updateStudent(id, payload);
    } else {
      await api.createStudent(payload);
    }
    resetForm();
    loadStudents();
  } catch (err) {
    formError.textContent = err.message;
    formError.classList.remove('hidden');
  }
});

// ---------- Student list ----------
function buildQuery() {
  const params = new URLSearchParams();
  if (searchInput.value.trim()) params.set('search', searchInput.value.trim());
  if (filterFeeStatus.value) params.set('fee_status', filterFeeStatus.value);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

function feeBadge(status) {
  return `<span class="badge ${status}">${status}</span>`;
}

function renderStudents(students) {
  tbody.innerHTML = '';

  if (students.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  }
  emptyState.classList.add('hidden');

  for (const s of students) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(s.name)}</td>
      <td>${escapeHtml(s.roll_no)}</td>
      <td>${escapeHtml(s.department)}</td>
      <td>${escapeHtml(s.bus_route)}</td>
      <td>${feeBadge(s.fee_status)}</td>
      <td class="row-actions">
        <button type="button" class="secondary" data-action="edit" data-id="${s.id}">Edit</button>
        <button type="button" class="secondary" data-action="status" data-id="${s.id}">Update Status</button>
        <button type="button" class="danger" data-action="delete" data-id="${s.id}">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

async function loadStudents() {
  try {
    const data = await api.listStudents(buildQuery());
    renderStudents(data.students);
  } catch (err) {
    alert(`Failed to load students: ${err.message}`);
  }
}

searchInput.addEventListener('input', debounce(loadStudents, 300));
filterFeeStatus.addEventListener('change', loadStudents);
refreshBtn.addEventListener('click', loadStudents);

// ---------- Row actions: edit / status / delete ----------
tbody.addEventListener('click', async (e) => {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;

  const { action, id } = btn.dataset;

  if (action === 'edit') {
    const { student } = await api.getStudent(id);
    fillFormForEdit(student);
  }

  if (action === 'status') {
    const { student } = await api.getStudent(id);
    const nextStatus = promptFeeStatus(student.fee_status);
    if (!nextStatus) return;
    try {
      await api.updateStudentStatus(id, { fee_status: nextStatus });
      loadStudents();
    } catch (err) {
      alert(`Failed to update status: ${err.message}`);
    }
  }

  if (action === 'delete') {
    if (!confirm('Remove this student? This cannot be undone.')) return;
    try {
      await api.removeStudent(id);
      loadStudents();
    } catch (err) {
      alert(`Failed to remove student: ${err.message}`);
    }
  }
});

function promptFeeStatus(current) {
  const options = ['paid', 'pending', 'unpaid'];
  const input = prompt(
    `Enter new fee status (${options.join(' / ')}):`,
    current
  );
  if (!input) return null;
  const value = input.trim().toLowerCase();
  if (!options.includes(value)) {
    alert(`Invalid status. Must be one of: ${options.join(', ')}`);
    return null;
  }
  return value;
}

// ---------- Utils ----------
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// ---------- Init ----------
(function init() {
  const token = getToken();
  const username = localStorage.getItem('username');
  if (token) {
    showDashboard(username);
  } else {
    showLogin();
  }
})();
