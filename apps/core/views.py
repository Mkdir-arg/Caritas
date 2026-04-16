from django.contrib import messages
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.contrib.auth.views import LoginView, LogoutView
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.db.models import Count
from django.http import JsonResponse
from django.utils import timezone
from django.urls import reverse_lazy
from django.views.generic import CreateView, TemplateView, UpdateView, View
from datetime import timedelta

from .forms import AccessGroupForm, AccessUserCreateForm, AccessUserUpdateForm


User = get_user_model()


def build_dashboard_summary():
    total_users = User.objects.count()
    active_users = User.objects.filter(is_active=True).count()
    inactive_users = total_users - active_users
    staff_users = User.objects.filter(is_staff=True).count()
    recent_threshold = timezone.now() - timedelta(days=30)
    recent_users = User.objects.prefetch_related("groups").order_by("-date_joined")[:5]
    top_groups_queryset = Group.objects.annotate(member_count=Count("user")).order_by("-member_count", "name")[:5]
    top_groups = list(top_groups_queryset)
    groups_with_members = sum(1 for group in top_groups if group.member_count > 0)

    return {
        "user_count": total_users,
        "active_user_count": active_users,
        "inactive_user_count": inactive_users,
        "staff_user_count": staff_users,
        "group_count": Group.objects.count(),
        "recent_user_count": User.objects.filter(date_joined__gte=recent_threshold).count(),
        "active_user_ratio": round((active_users / total_users) * 100) if total_users else 0,
        "group_coverage_ratio": round((groups_with_members / len(top_groups)) * 100) if top_groups else 0,
        "recent_users": [
            {
                "username": user.username,
                "initial": (user.username[:1] or "-").upper(),
                "full_name": f"{user.first_name} {user.last_name}".strip() or "Sin nombre cargado",
                "email": user.email or "-",
                "is_active": user.is_active,
                "date_joined": user.date_joined.strftime("%Y-%m-%d"),
                "groups": [group.name for group in user.groups.all()[:2]],
            }
            for user in recent_users
        ],
        "top_groups": [
            {
                "id": group.pk,
                "name": group.name,
                "member_count": group.member_count,
                "coverage_percent": round((group.member_count / total_users) * 100) if total_users else 0,
            }
            for group in top_groups
        ],
    }


class StaffRequiredMixin(LoginRequiredMixin, UserPassesTestMixin):
    def test_func(self):
        return self.request.user.is_staff


class DashboardShellMixin:
    active_nav = "dashboard"
    page_kicker = "Resumen"
    page_title = "Vista general"
    page_description = "Lectura rápida de actividad y estado del sistema."

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context.update(
            {
                "active_nav": self.active_nav,
                "page_kicker": self.page_kicker,
                "page_title": self.page_title,
                "page_description": self.page_description,
            }
        )
        return context


class SignInView(LoginView):
    template_name = "auth/login.html"
    redirect_authenticated_user = True

    def form_valid(self, form):
        response = super().form_valid(form)

        if not self.request.POST.get("remember"):
            self.request.session.set_expiry(0)

        return response


class DashboardView(StaffRequiredMixin, DashboardShellMixin, TemplateView):
    template_name = "dashboard/home.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context.update(build_dashboard_summary())
        return context


class DashboardSummaryView(StaffRequiredMixin, View):
    def get(self, request, *args, **kwargs):
        return JsonResponse(build_dashboard_summary())


class AccessManagementView(StaffRequiredMixin, DashboardShellMixin, TemplateView):
    template_name = "dashboard/access_management.html"
    active_nav = "access"
    page_kicker = "Accesos"
    page_title = "Usuarios y grupos"
    page_description = "Administrá cuentas internas y roles sin salir del sistema."

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context.update(
            {
                "users": User.objects.prefetch_related("groups").order_by("username"),
                "groups": Group.objects.annotate(member_count=Count("user")).order_by("name"),
                "user_total": User.objects.count(),
                "active_user_total": User.objects.filter(is_active=True).count(),
                "group_total": Group.objects.count(),
            }
        )
        return context


class AccessUserCreateView(StaffRequiredMixin, DashboardShellMixin, CreateView):
    template_name = "dashboard/access_form.html"
    form_class = AccessUserCreateForm
    success_url = reverse_lazy("core:access_management")
    active_nav = "access"
    page_kicker = "Accesos"
    page_title = "Nuevo usuario"
    page_description = "Creá una cuenta interna y asociála a los grupos necesarios."

    def form_valid(self, form):
        response = super().form_valid(form)
        messages.success(self.request, "Usuario creado correctamente.")
        return response


class AccessUserUpdateView(StaffRequiredMixin, DashboardShellMixin, UpdateView):
    template_name = "dashboard/access_form.html"
    form_class = AccessUserUpdateForm
    model = User
    success_url = reverse_lazy("core:access_management")
    active_nav = "access"
    page_kicker = "Accesos"
    page_title = "Editar usuario"
    page_description = "Actualizá datos, estado y grupos del usuario."

    def form_valid(self, form):
        response = super().form_valid(form)
        messages.success(self.request, "Usuario actualizado correctamente.")
        return response


class AccessGroupCreateView(StaffRequiredMixin, DashboardShellMixin, CreateView):
    template_name = "dashboard/access_form.html"
    form_class = AccessGroupForm
    success_url = reverse_lazy("core:access_management")
    active_nav = "access"
    page_kicker = "Accesos"
    page_title = "Nuevo grupo"
    page_description = "Definí un rol y seleccioná sus permisos disponibles."

    def form_valid(self, form):
        response = super().form_valid(form)
        messages.success(self.request, "Grupo creado correctamente.")
        return response


class AccessGroupUpdateView(StaffRequiredMixin, DashboardShellMixin, UpdateView):
    template_name = "dashboard/access_form.html"
    form_class = AccessGroupForm
    model = Group
    success_url = reverse_lazy("core:access_management")
    active_nav = "access"
    page_kicker = "Accesos"
    page_title = "Editar grupo"
    page_description = "Ajustá el nombre del grupo y sus permisos asignados."

    def form_valid(self, form):
        response = super().form_valid(form)
        messages.success(self.request, "Grupo actualizado correctamente.")
        return response


class SignOutView(LogoutView):
    pass
