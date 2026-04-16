from django import forms
from django.contrib.auth import get_user_model
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import Group, Permission


User = get_user_model()


def _style_fields(form):
    base_input = "mt-2 block w-full rounded-2xl border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm focus:border-brand-500 focus:ring-brand-500 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100"
    checkbox_input = "h-4 w-4 rounded border-slate-300 text-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900"

    for field in form.fields.values():
        widget = field.widget

        if isinstance(widget, forms.CheckboxInput):
            widget.attrs["class"] = checkbox_input
            continue

        if isinstance(widget, forms.SelectMultiple):
            widget.attrs["class"] = base_input + " min-h-40"
            continue

        widget.attrs["class"] = base_input


class AccessUserCreateForm(UserCreationForm):
    groups = forms.ModelMultipleChoiceField(
        queryset=Group.objects.order_by("name"),
        required=False,
        label="Grupos",
    )

    class Meta(UserCreationForm.Meta):
        model = User
        fields = ("username", "first_name", "last_name", "email", "is_active", "is_staff", "groups")
        labels = {
            "username": "Usuario",
            "first_name": "Nombre",
            "last_name": "Apellido",
            "email": "Correo electrónico",
            "is_active": "Activo",
            "is_staff": "Acceso al panel interno",
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["password1"].label = "Contraseña"
        self.fields["password2"].label = "Repetir contraseña"
        _style_fields(self)


class AccessUserUpdateForm(forms.ModelForm):
    groups = forms.ModelMultipleChoiceField(
        queryset=Group.objects.order_by("name"),
        required=False,
        label="Grupos",
    )

    class Meta:
        model = User
        fields = ("username", "first_name", "last_name", "email", "is_active", "is_staff", "groups")
        labels = {
            "username": "Usuario",
            "first_name": "Nombre",
            "last_name": "Apellido",
            "email": "Correo electrónico",
            "is_active": "Activo",
            "is_staff": "Acceso al panel interno",
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        _style_fields(self)


class AccessGroupForm(forms.ModelForm):
    permissions = forms.ModelMultipleChoiceField(
        queryset=Permission.objects.select_related("content_type").order_by("content_type__app_label", "codename"),
        required=False,
        label="Permisos",
    )

    class Meta:
        model = Group
        fields = ("name", "permissions")
        labels = {
            "name": "Nombre del grupo",
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        _style_fields(self)
