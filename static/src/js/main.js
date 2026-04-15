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
  const dashboardSidebar = document.querySelector("[data-dashboard-sidebar]");
  const dashboardBackdrop = document.querySelector("[data-dashboard-backdrop]");
  const dashboardToggle = document.querySelector("[data-dashboard-toggle]");

  const closeSidebar = () => {
    dashboardSidebar?.classList.add("-translate-x-full");
    dashboardBackdrop?.classList.add("pointer-events-none", "opacity-0");
    dashboardBackdrop?.classList.remove("pointer-events-auto", "opacity-100");
  };

  const openSidebar = () => {
    dashboardSidebar?.classList.remove("-translate-x-full");
    dashboardBackdrop?.classList.remove("pointer-events-none", "opacity-0");
    dashboardBackdrop?.classList.add("pointer-events-auto", "opacity-100");
  };

  if (dashboardToggle && dashboardSidebar && dashboardBackdrop) {
    dashboardToggle.addEventListener("click", () => {
      const isOpen = !dashboardSidebar.classList.contains("-translate-x-full");
      if (isOpen) {
        closeSidebar();
      } else {
        openSidebar();
      }
    });

    dashboardBackdrop.addEventListener("click", closeSidebar);

    window.addEventListener("resize", () => {
      if (window.innerWidth >= 1024) {
        closeSidebar();
      }
    });
  }

  if (passwordToggle && passwordInput) {
    passwordToggle.addEventListener("click", () => {
      const isPassword = passwordInput.getAttribute("type") === "password";
      passwordInput.setAttribute("type", isPassword ? "text" : "password");

      passwordToggle.querySelector('[data-password-eye="closed"]')?.classList.toggle("hidden", isPassword);
      passwordToggle.querySelector('[data-password-eye="open"]')?.classList.toggle("hidden", !isPassword);
    });
  }
});