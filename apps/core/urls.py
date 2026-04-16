from django.urls import path

from .views import (
    AccessGroupCreateView,
    AccessGroupUpdateView,
    AccessManagementView,
    DashboardSummaryView,
    AccessUserCreateView,
    AccessUserUpdateView,
    DashboardView,
    SignInView,
    SignOutView,
)


app_name = "core"

urlpatterns = [
    path("", SignInView.as_view(), name="login"),
    path("dashboard/", DashboardView.as_view(), name="dashboard"),
    path("dashboard/live/summary/", DashboardSummaryView.as_view(), name="dashboard_summary"),
    path("admin/", AccessManagementView.as_view(), name="access_management"),
    path("admin/usuarios/nuevo/", AccessUserCreateView.as_view(), name="user_create"),
    path("admin/usuarios/<int:pk>/editar/", AccessUserUpdateView.as_view(), name="user_update"),
    path("admin/grupos/nuevo/", AccessGroupCreateView.as_view(), name="group_create"),
    path("admin/grupos/<int:pk>/editar/", AccessGroupUpdateView.as_view(), name="group_update"),
    path("logout/", SignOutView.as_view(), name="logout"),
]
