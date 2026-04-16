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
  const loginForm = document.querySelector("[data-login-form]");
  const loginSubmitButton = document.querySelector("[data-login-submit]");
  const loginSubmitLabel = document.querySelector("[data-login-submit-label]");
  const loginSpinner = document.querySelector("[data-login-spinner]");
  const dashboardLiveRoot = document.querySelector("[data-dashboard-live-root]");
  const dashboardLiveIndicator = document.querySelector("[data-dashboard-live-indicator]");
  const dashboardLiveIndicatorText = document.querySelector("[data-dashboard-live-indicator-text]");

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

  if (loginForm && loginSubmitButton && loginSubmitLabel && loginSpinner) {
    loginForm.addEventListener("submit", () => {
      loginSubmitButton.setAttribute("disabled", "disabled");
      loginSubmitButton.classList.add("pointer-events-none");
      loginSpinner.classList.remove("hidden");
      loginSubmitLabel.textContent = "Ingresando...";
    });
  }

  if (dashboardLiveRoot) {
    const summaryUrl = dashboardLiveRoot.getAttribute("data-dashboard-summary-url");
    const websocketPath = dashboardLiveRoot.getAttribute("data-dashboard-websocket-path");
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    let reconnectTimer;

    const escapeHtml = (value) =>
      String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");

    const setDashboardIndicatorState = (state) => {
      if (!dashboardLiveIndicator) {
        return;
      }

      const dot = dashboardLiveIndicator.querySelector("span");
      dashboardLiveIndicator.classList.remove("bg-emerald-50", "text-emerald-600", "dark:bg-emerald-500/10", "dark:text-emerald-300", "bg-amber-50", "text-amber-600", "dark:bg-amber-500/10", "dark:text-amber-300", "bg-rose-50", "text-rose-600", "dark:bg-rose-500/10", "dark:text-rose-300");
      dot?.classList.remove("bg-emerald-500", "bg-amber-500", "bg-rose-500");

      if (state === "connected") {
        dashboardLiveIndicator.classList.add("bg-emerald-50", "text-emerald-600", "dark:bg-emerald-500/10", "dark:text-emerald-300");
        dot?.classList.add("bg-emerald-500");
        if (dashboardLiveIndicatorText) {
          dashboardLiveIndicatorText.textContent = "Tiempo real activo";
        }
        return;
      }

      if (state === "reconnecting") {
        dashboardLiveIndicator.classList.add("bg-amber-50", "text-amber-600", "dark:bg-amber-500/10", "dark:text-amber-300");
        dot?.classList.add("bg-amber-500");
        if (dashboardLiveIndicatorText) {
          dashboardLiveIndicatorText.textContent = "Reconectando...";
        }
        return;
      }

      dashboardLiveIndicator.classList.add("bg-rose-50", "text-rose-600", "dark:bg-rose-500/10", "dark:text-rose-300");
      dot?.classList.add("bg-rose-500");
      if (dashboardLiveIndicatorText) {
        dashboardLiveIndicatorText.textContent = "Sin conexion";
      }
    };

    const buildRecentUsersMarkup = (users) => {
      if (!users.length) {
        return '<tr><td colspan="5" class="px-6 py-14 text-center text-sm font-medium text-slate-500 dark:text-gray-400">Todavía no hay usuarios para mostrar.</td></tr>';
      }

      return users
        .map((user) => {
          const groupsMarkup = user.groups.length
            ? user.groups
                .map(
                  (group) => `<span class="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-gray-800 dark:text-gray-300">${escapeHtml(group)}</span>`
                )
                .join("")
            : '<span class="text-xs text-slate-400 dark:text-gray-500">Sin grupos</span>';

          const statusMarkup = user.is_active
            ? '<span class="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300"><span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>Activo</span>'
            : '<span class="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-600 dark:bg-amber-500/10 dark:text-amber-300"><span class="h-1.5 w-1.5 rounded-full bg-amber-500"></span>Pendiente</span>';

          return `
            <tr class="transition hover:bg-slate-50/70 dark:hover:bg-gray-950/40">
              <td class="px-6 py-3.5 align-middle">
                <div class="flex items-center gap-3">
                  <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">${escapeHtml(user.initial)}</div>
                  <div class="min-w-0">
                    <p class="truncate text-sm font-semibold text-ink dark:text-white/90">${escapeHtml(user.username)}</p>
                    <p class="truncate text-xs text-slate-500 dark:text-gray-400">${escapeHtml(user.full_name)}</p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3.5 align-middle text-sm text-slate-600 dark:text-gray-300"><span class="block truncate">${escapeHtml(user.email)}</span></td>
              <td class="px-4 py-3.5 align-middle"><div class="flex flex-wrap gap-1.5">${groupsMarkup}</div></td>
              <td class="px-4 py-3.5 align-middle">${statusMarkup}</td>
              <td class="px-6 py-3.5 text-right align-middle text-sm text-slate-600 dark:text-gray-300 whitespace-nowrap">${escapeHtml(user.date_joined)}</td>
            </tr>`;
        })
        .join("");
    };

    const buildTopGroupsMarkup = (groups) => {
      if (!groups.length) {
        return '<div class="rounded-xl border border-dashed border-slate-200 px-6 py-12 text-center dark:border-gray-800"><p class="text-sm font-medium text-slate-500 dark:text-gray-400">Todavía no hay roles creados.</p></div>';
      }

      return groups
        .map(
          (group) => `
            <div class="rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-4 dark:border-gray-800 dark:bg-gray-950/60">
              <div class="flex items-center justify-between gap-3">
                <div class="min-w-0">
                  <p class="truncate text-sm font-semibold text-ink dark:text-white/90">${escapeHtml(group.name)}</p>
                  <p class="mt-1 text-sm text-slate-500 dark:text-gray-400">${group.member_count} integrante${group.member_count === 1 ? '' : 's'}</p>
                </div>
                <a href="/admin/grupos/${group.id}/editar/" class="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-600 transition duration-150 ease-out hover:border-brand-200 hover:text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2 dark:border-gray-700 dark:text-gray-300 dark:hover:border-brand-500/40 dark:hover:text-brand-300 dark:focus-visible:ring-offset-gray-900">Editar</a>
              </div>
              <div class="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-gray-800">
                <span class="block h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-300" style="width: ${group.coverage_percent}%"></span>
              </div>
            </div>`
        )
        .join("");
    };

    const updateDashboardSummary = (summary) => {
      const metrics = {
        user_count: summary.user_count,
        active_user_count: summary.active_user_count,
        inactive_user_count: summary.inactive_user_count,
        staff_user_count: summary.staff_user_count,
        group_count: summary.group_count,
        recent_user_count: summary.recent_user_count,
        active_user_ratio: summary.active_user_ratio,
        group_coverage_ratio: summary.group_coverage_ratio,
        active_user_ratio_text: `${summary.active_user_ratio}%`,
      };

      Object.entries(metrics).forEach(([key, value]) => {
        document.querySelectorAll(`[data-dashboard-metric="${key}"]`).forEach((node) => {
          node.textContent = value;
        });
      });

      document.querySelectorAll('[data-dashboard-bar="active_user_ratio"]').forEach((node) => {
        node.style.width = `${summary.active_user_ratio}%`;
      });

      const recentUsersTarget = document.querySelector('[data-dashboard-recent-users]');
      if (recentUsersTarget) {
        recentUsersTarget.innerHTML = buildRecentUsersMarkup(summary.recent_users);
      }

      const topGroupsTarget = document.querySelector('[data-dashboard-top-groups]');
      if (topGroupsTarget) {
        topGroupsTarget.innerHTML = buildTopGroupsMarkup(summary.top_groups);
      }

      const activeStatus = document.querySelector('[data-dashboard-copy="active_status"]');
      if (activeStatus) {
        activeStatus.textContent = `${summary.active_user_count} de ${summary.user_count} usuarios ya tienen acceso habilitado al sistema.`;
      }

      const inactiveStatus = document.querySelector('[data-dashboard-copy="inactive_status"]');
      if (inactiveStatus) {
        inactiveStatus.textContent =
          summary.inactive_user_count === 1
            ? 'Hay 1 cuenta inactiva que podría requerir seguimiento.'
            : `Hay ${summary.inactive_user_count} cuentas inactivas que podrían requerir seguimiento.`;
      }

      const groupStatus = document.querySelector('[data-dashboard-copy="group_status"]');
      if (groupStatus) {
        const groupWord = summary.group_count === 1 ? 'grupo disponible' : 'grupos disponibles';
        groupStatus.textContent = `Hay ${summary.group_count} ${groupWord} para distribuir permisos sin asignarlos usuario por usuario.`;
      }
    };

    const fetchDashboardSummary = async () => {
      if (!summaryUrl) {
        return;
      }

      const response = await fetch(summaryUrl, {
        headers: {
          "X-Requested-With": "XMLHttpRequest",
        },
        credentials: "same-origin",
      });

      if (!response.ok) {
        throw new Error("No se pudo refrescar el dashboard realtime.");
      }

      const summary = await response.json();
      updateDashboardSummary(summary);
    };

    const connectDashboardSocket = () => {
      if (!websocketPath) {
        return;
      }

      const socket = new WebSocket(`${protocol}://${window.location.host}${websocketPath}`);

      socket.addEventListener("open", () => {
        setDashboardIndicatorState("connected");
      });

      socket.addEventListener("message", async (event) => {
        const payload = JSON.parse(event.data);

        if (payload.type === "dashboard.refresh") {
          try {
            await fetchDashboardSummary();
          } catch (error) {
            console.error(error);
          }
        }
      });

      socket.addEventListener("close", () => {
        setDashboardIndicatorState("reconnecting");
        window.clearTimeout(reconnectTimer);
        reconnectTimer = window.setTimeout(connectDashboardSocket, 2500);
      });

      socket.addEventListener("error", () => {
        setDashboardIndicatorState("disconnected");
        socket.close();
      });
    };

    connectDashboardSocket();
  }
});