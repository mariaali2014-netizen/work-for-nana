/* ==========================================================================
   NANA MINI MART — auth.js
   Demo authentication using LocalStorage.
   IMPORTANT: This is NOT secure production authentication. Passwords are
   stored in plain text in the browser's LocalStorage purely so this
   frontend-only demo has a working Login/Signup flow. Never do this in a
   real production system — use a real backend with hashed passwords.
   ========================================================================== */

function getUsers() {
  return JSON.parse(localStorage.getItem(LS_USERS) || "[]");
}
function saveUsers(users) {
  localStorage.setItem(LS_USERS, JSON.stringify(users));
}

function markInvalid(input, invalid) {
  input.classList.toggle("is-invalid", invalid);
}

/* ---------- Signup ---------- */
function initSignupForm() {
  const form = document.getElementById("signupForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("signupName");
    const email = document.getElementById("signupEmail");
    const phone = document.getElementById("signupPhone");
    const password = document.getElementById("signupPassword");
    const confirm = document.getElementById("signupConfirmPassword");
    const terms = document.getElementById("signupTerms");

    let valid = true;

    const nameValid = name.value.trim().length >= 2;
    markInvalid(name, !nameValid); if (!nameValid) valid = false;

    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
    markInvalid(email, !emailValid); if (!emailValid) valid = false;

    const phoneValid = /^03\d{9}$/.test(phone.value.trim().replace(/[\s-]/g, ""));
    markInvalid(phone, !phoneValid); if (!phoneValid) valid = false;

    const passwordValid = password.value.length >= 6;
    markInvalid(password, !passwordValid); if (!passwordValid) valid = false;

    const confirmValid = confirm.value === password.value && password.value.length > 0;
    markInvalid(confirm, !confirmValid); if (!confirmValid) valid = false;

    const termsValid = terms.checked;
    markInvalid(terms, !termsValid); if (!termsValid) valid = false;

    if (!valid) {
      showToast("Please fix the highlighted fields", "error");
      return;
    }

    const users = getUsers();
    if (users.some(u => u.email.toLowerCase() === email.value.trim().toLowerCase())) {
      showToast("An account with this email already exists", "error");
      markInvalid(email, true);
      return;
    }

    users.push({
      name: name.value.trim(),
      email: email.value.trim(),
      phone: phone.value.trim(),
      // Demo only — plain text storage is NOT secure, never do this in production.
      password: password.value,
    });
    saveUsers(users);

    showToast("Account created successfully.");
    setTimeout(() => { window.location.href = "login.html"; }, 1200);
  });
}

/* ---------- Login ---------- */
function initLoginForm() {
  const form = document.getElementById("loginForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const identifier = document.getElementById("loginIdentifier");
    const password = document.getElementById("loginPassword");

    let valid = true;
    const idValid = identifier.value.trim().length > 0;
    markInvalid(identifier, !idValid); if (!idValid) valid = false;
    const pwValid = password.value.length >= 6;
    markInvalid(password, !pwValid); if (!pwValid) valid = false;

    if (!valid) {
      showToast("Please fill in your login details", "error");
      return;
    }

    const id = identifier.value.trim().toLowerCase();
    const users = getUsers();
    const user = users.find(u => u.email.toLowerCase() === id || u.phone === identifier.value.trim());

    if (!user || user.password !== password.value) {
      showToast("Invalid credentials. Please check and try again.", "error");
      markInvalid(password, true);
      return;
    }

    localStorage.setItem(LS_USER, JSON.stringify({ name: user.name, email: user.email }));
    showToast(`Welcome back, ${user.name.split(" ")[0]}!`);
    setTimeout(() => { window.location.href = "index.html"; }, 900);
  });

  const forgot = document.getElementById("forgotPasswordLink");
  if (forgot) {
    forgot.addEventListener("click", (e) => {
      e.preventDefault();
      showToast("Password reset link would be sent to your email (demo only).", "info");
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initSignupForm();
  initLoginForm();
});
