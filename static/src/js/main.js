document.addEventListener("DOMContentLoaded", () => {
  const root = document.documentElement;
  const savedTheme = localStorage.getItem("darkMode");

  if (savedTheme === "true") {
    root.classList.add("dark");
  }

  const themeToggle = document.querySelector("[data-theme-toggle]");
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const isDark = root.classList.toggle("dark");
      localStorage.setItem("darkMode", String(isDark));
    });
  }

  const passwordToggle = document.querySelector("[data-password-toggle]");
  const passwordInput = document.querySelector("[data-password-input]");

  if (passwordToggle && passwordInput) {
    passwordToggle.addEventListener("click", () => {
      const isPassword = passwordInput.getAttribute("type") === "password";
      passwordInput.setAttribute("type", isPassword ? "text" : "password");

      passwordToggle.querySelector('[data-password-eye="closed"]')?.classList.toggle("hidden", isPassword);
      passwordToggle.querySelector('[data-password-eye="open"]')?.classList.toggle("hidden", !isPassword);
    });
  }
});