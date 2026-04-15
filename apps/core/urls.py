from django.urls import path

from .views import DashboardView, SignInView, SignOutView


app_name = "core"

urlpatterns = [
    path("", SignInView.as_view(), name="login"),
    path("dashboard/", DashboardView.as_view(), name="dashboard"),
    path("logout/", SignOutView.as_view(), name="logout"),
]
