document.addEventListener("DOMContentLoaded", () => {
  const root = document.documentElement;
  const savedTheme = localStorage.getItem("darkMode");
  const isDesktop = () => window.innerWidth >= 1024;
  const syncThemeToggleLabel = () => {
    const toggleButtons = document.querySelectorAll("[data-theme-toggle]");
    const isDark = root.classList.contains("dark");
    const nextActionLabel = isDark ? "Activar modo claro" : "Activar modo oscuro";

    toggleButtons.forEach((button) => {
      button.setAttribute("aria-label", nextActionLabel);
      button.setAttribute("title", nextActionLabel);
    });
  };

  if (savedTheme === "true") {
    root.classList.add("dark");
  }

  syncThemeToggleLabel();

  const themeToggle = document.querySelector("[data-theme-toggle]");
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const isDark = root.classList.toggle("dark");
      localStorage.setItem("darkMode", String(isDark));
      syncThemeToggleLabel();
    });
  }

  const passwordToggle = document.querySelector("[data-password-toggle]");
  const passwordInput = document.querySelector("[data-password-input]");
  const dashboardShell = document.querySelector("[data-dashboard-shell]");
  const dashboardSidebar = document.querySelector("[data-dashboard-sidebar]");
  const dashboardContent = document.querySelector("[data-dashboard-content]");
  const dashboardBackdrop = document.querySelector("[data-dashboard-backdrop]");
  const dashboardToggle = document.querySelector("[data-dashboard-toggle]");
  const dashboardCollapse = document.querySelector("[data-dashboard-collapse]");
  const dashboardCollapseIcon = document.querySelector("[data-dashboard-collapse-icon]");
  const sidebarLabels = document.querySelectorAll("[data-sidebar-label]");
  const sidebarHeadings = document.querySelectorAll("[data-sidebar-heading]");
  const sidebarBrand = document.querySelector("[data-sidebar-brand]");
  const sidebarItems = document.querySelectorAll("[data-sidebar-item]");
  const sidebarBadges = document.querySelectorAll("[data-sidebar-badge]");
  const accessTabs = document.querySelectorAll("[data-access-tab]");
  const accessPanels = document.querySelectorAll("[data-access-panel]");

  const syncSidebarCollapseState = (collapsed) => {
    if (!dashboardShell || !dashboardSidebar) {
      return;
    }

    dashboardSidebar.classList.toggle("lg:w-[88px]", collapsed);
    dashboardSidebar.classList.toggle("lg:px-3", collapsed);
    dashboardSidebar.classList.toggle("lg:w-[250px]", !collapsed);
    dashboardSidebar.classList.toggle("lg:px-4", !collapsed);
    dashboardContent?.classList.toggle("lg:pl-[88px]", collapsed);
    dashboardContent?.classList.toggle("lg:pl-[250px]", !collapsed);

    sidebarBrand?.classList.toggle("hidden", collapsed);

    sidebarLabels.forEach((label) => {
      label.classList.toggle("hidden", collapsed);
    });

    sidebarHeadings.forEach((heading) => {
      heading.classList.toggle("hidden", collapsed);
    });

    sidebarBadges.forEach((badge) => {
      badge.classList.toggle("hidden", collapsed);
    });

    sidebarItems.forEach((item) => {
      item.classList.toggle("justify-center", collapsed);
      item.classList.toggle("px-2", collapsed);
      item.classList.toggle("px-3", !collapsed);
    });

    dashboardCollapseIcon?.classList.toggle("rotate-180", collapsed);

    if (dashboardCollapse) {
      const nextActionLabel = collapsed ? "Expandir menu lateral" : "Contraer menu lateral";
      dashboardCollapse.setAttribute("aria-label", nextActionLabel);
      dashboardCollapse.setAttribute("title", nextActionLabel);
    }
  };

  const storedSidebarState = localStorage.getItem("dashboardSidebarCollapsed") === "true";
  if (isDesktop()) {
    syncSidebarCollapseState(storedSidebarState);
  }

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
        syncSidebarCollapseState(localStorage.getItem("dashboardSidebarCollapsed") === "true");
      }
    });
  }

  if (dashboardCollapse) {
    dashboardCollapse.addEventListener("click", () => {
      const nextCollapsed = !dashboardSidebar?.classList.contains("lg:w-[88px]");
      localStorage.setItem("dashboardSidebarCollapsed", String(nextCollapsed));
      syncSidebarCollapseState(nextCollapsed);
    });
  }

  if (accessTabs.length && accessPanels.length) {
    const setActiveAccessTab = (tabName) => {
      accessTabs.forEach((tab) => {
        const isActive = tab.dataset.accessTab === tabName;
        tab.setAttribute("aria-selected", String(isActive));
        tab.classList.toggle("bg-white", isActive);
        tab.classList.toggle("text-ink", isActive);
        tab.classList.toggle("shadow-sm", isActive);
        tab.classList.toggle("dark:bg-gray-900", isActive);
        tab.classList.toggle("dark:text-white/90", isActive);
        tab.classList.toggle("text-slate-500", !isActive);
        tab.classList.toggle("dark:text-gray-400", !isActive);
      });

      accessPanels.forEach((panel) => {
        panel.classList.toggle("hidden", panel.dataset.accessPanel !== tabName);
      });
    };

    const activeTab = Array.from(accessTabs).find((tab) => tab.getAttribute("aria-selected") === "true")?.dataset.accessTab || "users";
    setActiveAccessTab(activeTab);

    accessTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        setActiveAccessTab(tab.dataset.accessTab);
      });
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