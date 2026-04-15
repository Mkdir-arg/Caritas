from django.contrib.auth.views import LoginView, LogoutView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import TemplateView


class SignInView(LoginView):
    template_name = "auth/login.html"
    redirect_authenticated_user = True

    def form_valid(self, form):
        response = super().form_valid(form)

        if not self.request.POST.get("remember"):
            self.request.session.set_expiry(0)

        return response


class DashboardView(LoginRequiredMixin, TemplateView):
    template_name = "dashboard/home.html"


class SignOutView(LogoutView):
    pass
