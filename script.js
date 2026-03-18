/* ================================================
   script.js — WebDev Course
   Handles: Theme toggle, scroll progress,
            stat counters, form validation,
            DOM manipulation playground,
            toast notifications
   ================================================ */

/* ---- Theme Toggle ---- */
const themeBtn = document.getElementById('themeBtn');
const html     = document.documentElement;

// Load saved theme
const savedTheme = localStorage.getItem('wdc-theme') || 'dark';
html.setAttribute('data-theme', savedTheme);
if (themeBtn) themeBtn.textContent = savedTheme === 'dark' ? '🌙' : '☀️';

if (themeBtn) {
  themeBtn.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    const next    = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    themeBtn.textContent = next === 'dark' ? '🌙' : '☀️';
    localStorage.setItem('wdc-theme', next);
    showToast(next === 'dark' ? '🌙 Dark mode on' : '☀️ Light mode on');
  });
}

/* ---- Scroll Progress Bar ---- */
const scrollProg = document.getElementById('scrollProg');
if (scrollProg) {
  window.addEventListener('scroll', () => {
    const doc     = document.documentElement;
    const scrolled = doc.scrollTop;
    const total    = doc.scrollHeight - doc.clientHeight;
    const pct      = total > 0 ? (scrolled / total) * 100 : 0;
    scrollProg.style.width = pct + '%';
  });
}

/* ---- Stat Counter Animation ---- */
function animateCounter(el) {
  const target = parseInt(el.getAttribute('data-to'), 10);
  const suffix = el.getAttribute('data-sfx') || '';
  const duration = 1200;
  const start    = performance.now();

  function step(now) {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target) + (progress === 1 ? suffix : '');
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// Intersection Observer to trigger counters when visible
const statNums = document.querySelectorAll('.sn[data-to]');
if (statNums.length) {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  statNums.forEach(el => obs.observe(el));
}

/* ================================================
   FORM VALIDATION & DOM MANIPULATION
   (Only runs on index.html)
   ================================================ */

// ---- Helper: show/clear error ----
function setError(inputId, errId, message) {
  const input = document.getElementById(inputId);
  const span  = document.getElementById(errId);
  if (!input || !span) return;
  if (message) {
    span.textContent = message;
    input.classList.add('error');
  } else {
    span.textContent = '';
    input.classList.remove('error');
  }
}

// ---- Clear errors on input ----
['fname', 'femail', 'fphone', 'fco'].forEach(id => {
  const el = document.getElementById(id);
  if (el) {
    el.addEventListener('input', () => {
      el.classList.remove('error');
      const errEl = document.getElementById(id + 'Err');
      if (errEl) errEl.textContent = '';
    });
  }
});

// ---- Student list array (in-memory) ----
let students = [];

// ---- Form Submit ----
const submitBtn = document.getElementById('submitBtn');
if (submitBtn) {
  submitBtn.addEventListener('click', () => {
    let valid = true;

    const name  = document.getElementById('fname')?.value.trim()  || '';
    const email = document.getElementById('femail')?.value.trim() || '';
    const phone = document.getElementById('fphone')?.value.trim() || '';
    const co    = document.getElementById('fco')?.value           || '';
    const exp   = document.querySelector('input[name="exp"]:checked')?.value || '';
    const msg   = document.getElementById('fmsg')?.value.trim()  || '';
    const agree = document.getElementById('fagree')?.checked;

    // Validate Name
    if (!name) {
      setError('fname', 'fnameErr', '⚠ Full name is required.');
      valid = false;
    } else if (name.length < 3) {
      setError('fname', 'fnameErr', '⚠ Name must be at least 3 characters.');
      valid = false;
    } else {
      setError('fname', 'fnameErr', '');
    }

    // Validate Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setError('femail', 'femailErr', '⚠ Email is required.');
      valid = false;
    } else if (!emailRegex.test(email)) {
      setError('femail', 'femailErr', '⚠ Enter a valid email address.');
      valid = false;
    } else {
      setError('femail', 'femailErr', '');
    }

    // Validate Phone
    const phoneRegex = /^[+\d][\d\s\-]{8,14}$/;
    if (!phone) {
      setError('fphone', 'fphoneErr', '⚠ Phone number is required.');
      valid = false;
    } else if (!phoneRegex.test(phone)) {
      setError('fphone', 'fphoneErr', '⚠ Enter a valid phone number.');
      valid = false;
    } else {
      setError('fphone', 'fphoneErr', '');
    }

    // Validate CO selection
    if (!co) {
      setError('fco', 'fcoErr', '⚠ Please select a course outcome.');
      valid = false;
    } else {
      setError('fco', 'fcoErr', '');
    }

    // Validate Experience
    const expErr = document.getElementById('fexpErr');
    if (!exp) {
      if (expErr) expErr.textContent = '⚠ Please select your experience level.';
      valid = false;
    } else {
      if (expErr) expErr.textContent = '';
    }

    // Validate Agreement
    const agreeErr = document.getElementById('fagreeErr');
    if (!agree) {
      if (agreeErr) agreeErr.textContent = '⚠ You must agree to continue.';
      valid = false;
    } else {
      if (agreeErr) agreeErr.textContent = '';
    }

    if (!valid) {
      showToast('❌ Please fix the errors above.', true);
      return;
    }

    // ---- All valid — DOM Manipulation: show output ----
    const student = { name, email, phone, co, exp, msg };
    students.push(student);

    renderFormOutput(student);
    renderStudentList();
    resetForm();
    showToast(`✅ ${name} enrolled successfully!`);
  });
}

function renderFormOutput(student) {
  const output = document.getElementById('formOutput');
  if (!output) return;

  output.innerHTML = `
    <h4>✅ Enrollment Submitted!</h4>
    <div class="out-row"><span class="out-key">Name:</span><span class="out-val">${escHtml(student.name)}</span></div>
    <div class="out-row"><span class="out-key">Email:</span><span class="out-val">${escHtml(student.email)}</span></div>
    <div class="out-row"><span class="out-key">Phone:</span><span class="out-val">${escHtml(student.phone)}</span></div>
    <div class="out-row"><span class="out-key">Course:</span><span class="out-val">${escHtml(student.co)}</span></div>
    <div class="out-row"><span class="out-key">Level:</span><span class="out-val">${escHtml(student.exp)}</span></div>
    ${student.msg ? `<div class="out-row"><span class="out-key">Message:</span><span class="out-val">${escHtml(student.msg)}</span></div>` : ''}
  `;
  output.style.display = 'block';
}

function renderStudentList() {
  const wrap = document.getElementById('studentListWrap');
  const list = document.getElementById('studentList');
  if (!wrap || !list) return;

  if (students.length === 0) {
    wrap.style.display = 'none';
    return;
  }

  wrap.style.display = 'block';
  list.innerHTML = '';

  students.forEach((s, idx) => {
    const item = document.createElement('div');
    item.className = 'student-item';
    item.innerHTML = `
      <div class="student-info">
        <strong>${escHtml(s.name)}</strong>
        <span>${escHtml(s.email)}</span>
        <span>${escHtml(s.co)}</span>
        <span>${escHtml(s.exp)}</span>
      </div>
      <button class="del-student" data-idx="${idx}">Remove</button>
    `;
    list.appendChild(item);
  });

  // Delegate delete button clicks
  list.querySelectorAll('.del-student').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(e.target.getAttribute('data-idx'), 10);
      const removed = students[idx];
      students.splice(idx, 1);
      renderStudentList();
      showToast(`🗑️ Removed ${removed.name}`);
    });
  });
}

// Clear all students
const clearBtn = document.getElementById('clearBtn');
if (clearBtn) {
  clearBtn.addEventListener('click', () => {
    students = [];
    renderStudentList();
    const output = document.getElementById('formOutput');
    if (output) output.style.display = 'none';
    showToast('🗑️ All students cleared.');
  });
}

function resetForm() {
  ['fname','femail','fphone','fco','fmsg'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.querySelectorAll('input[name="exp"]').forEach(r => r.checked = false);
  const agreeEl = document.getElementById('fagree');
  if (agreeEl) agreeEl.checked = false;
}

/* ================================================
   DOM MANIPULATION PLAYGROUND
   ================================================ */
const colorPicker  = document.getElementById('colorPicker');
const textChanger  = document.getElementById('textChanger');
const sizeSlider   = document.getElementById('sizeSlider');
const sizeVal      = document.getElementById('sizeVal');
const domBox       = document.getElementById('domBox');
const domText      = document.getElementById('domText');
const addParaBtn   = document.getElementById('addParaBtn');
const removeParaBtn= document.getElementById('removeParaBtn');
const toggleHideBtn= document.getElementById('toggleHideBtn');
const countBtn     = document.getElementById('countBtn');
const clickCountEl = document.getElementById('clickCount');
const paraContainer= document.getElementById('paraContainer');

let clickCount = 0;
const sampleTexts = [
  'DOM manipulation is super fun! 🎉',
  'createElement() creates new elements.',
  'appendChild() adds them to the page.',
  'addEventListener() listens for events.',
  'classList.toggle() switches CSS classes.',
  'querySelector() selects any element.',
  'style.property changes inline CSS.',
];

// Color picker changes box border and text color
if (colorPicker && domBox) {
  colorPicker.addEventListener('input', (e) => {
    domBox.style.borderColor = e.target.value;
    if (domText) domText.style.color = e.target.value;
  });
}

// Text input changes the domText content
if (textChanger && domText) {
  textChanger.addEventListener('input', (e) => {
    domText.textContent = e.target.value || 'Hello, DOM! 👋';
  });
}

// Slider changes font size
if (sizeSlider && domText && sizeVal) {
  sizeSlider.addEventListener('input', (e) => {
    const size = e.target.value;
    domText.style.fontSize = size + 'px';
    sizeVal.textContent = size + 'px';
  });
}

// Add paragraph
if (addParaBtn && paraContainer) {
  addParaBtn.addEventListener('click', () => {
    const p = document.createElement('p');
    p.className = 'dyn-para';
    const txt = sampleTexts[paraContainer.children.length % sampleTexts.length];
    p.textContent = '→ ' + txt;
    paraContainer.appendChild(p);
    showToast('✚ Paragraph added to DOM');
  });
}

// Remove last paragraph
if (removeParaBtn && paraContainer) {
  removeParaBtn.addEventListener('click', () => {
    const last = paraContainer.lastElementChild;
    if (last) {
      last.remove();
      showToast('✕ Paragraph removed from DOM');
    } else {
      showToast('No paragraphs to remove.', true);
    }
  });
}

// Toggle visibility of domBox
if (toggleHideBtn && domBox) {
  toggleHideBtn.addEventListener('click', () => {
    const hidden = domBox.style.opacity === '0';
    domBox.style.opacity   = hidden ? '1' : '0';
    domBox.style.transform = hidden ? 'scale(1)' : 'scale(0.95)';
    domBox.style.transition = 'opacity .3s, transform .3s';
    showToast(hidden ? '👁 Element visible' : '🙈 Element hidden');
  });
}

// Click counter
if (countBtn && clickCountEl) {
  countBtn.addEventListener('click', () => {
    clickCount++;
    clickCountEl.textContent = clickCount;
    if (clickCount % 5 === 0) showToast(`🎯 ${clickCount} clicks!`);
  });
}

/* ================================================
   TOAST NOTIFICATION SYSTEM
   ================================================ */
let toastWrap = document.querySelector('.toast-wrap');
if (!toastWrap) {
  toastWrap = document.createElement('div');
  toastWrap.className = 'toast-wrap';
  document.body.appendChild(toastWrap);
}

function showToast(message, isError = false) {
  const toast = document.createElement('div');
  toast.className = 'toast-item' + (isError ? ' error' : '');
  toast.textContent = message;
  toastWrap.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity   = '0';
    toast.style.transform = 'translateX(20px)';
    toast.style.transition = 'opacity .3s, transform .3s';
    setTimeout(() => toast.remove(), 350);
  }, 2800);
}

/* ---- Utility: Escape HTML to prevent XSS ---- */
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}