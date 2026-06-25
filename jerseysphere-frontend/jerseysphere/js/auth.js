/* ===========================================================
   JerseySphere — auth logic (mock, client-side only)
   =========================================================== */

function isValidPassword(pw) {
  return pw.length >= 8 && /[0-9]/.test(pw) && /[^A-Za-z0-9]/.test(pw);
}

function wireLoginForm() {
  const form = document.getElementById("login-form");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const result = loginUser({
      email: document.getElementById("login-email").value.trim(),
      password: document.getElementById("login-password").value,
    });
    const err = document.getElementById("login-error");
    if (!result.ok) {
      err.textContent = result.error;
      err.classList.remove("hidden");
      return;
    }
    toast("Welcome back, " + result.user.firstName);
    window.location.href = "account.html";
  });
}

function wireRegisterForm() {
  const form = document.getElementById("register-form");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("reg-email").value.trim();
    const password = document.getElementById("reg-password").value;
    const err = document.getElementById("register-error");

    if (!isValidPassword(password)) {
      err.textContent = "Password needs 8+ characters, a number and a special character.";
      err.classList.remove("hidden");
      return;
    }
    const result = registerUser({
      firstName: document.getElementById("reg-first").value.trim(),
      lastName: document.getElementById("reg-last").value.trim(),
      email, password,
    });
    if (!result.ok) {
      err.textContent = result.error;
      err.classList.remove("hidden");
      return;
    }
    document.getElementById("register-form-wrap").classList.add("hidden");
    document.getElementById("verify-wrap").classList.remove("hidden");
    document.getElementById("verify-email-shown").textContent = email;
  });

  const simulateBtn = document.getElementById("simulate-verify");
  if (simulateBtn) {
    simulateBtn.addEventListener("click", () => {
      verifyCurrentUserEmail();
      const user = currentUser();
      toast("Email verified — welcome, " + user.firstName);
      window.location.href = "account.html";
    });
  }
}

function wireGoogleDemoButtons() {
  document.querySelectorAll("#google-btn").forEach((btn) => {
    btn.addEventListener("click", () => toast("This is a placeholder — OAuth isn't wired up in this demo."));
  });
}

document.addEventListener("DOMContentLoaded", () => {
  wireLoginForm();
  wireRegisterForm();
  wireGoogleDemoButtons();
});
