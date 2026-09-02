from django.shortcuts import render, redirect
from django.contrib.auth import login, logout

from .forms import CustomUserCreationForm, LoginForm



def register_view(request):
    if request.user.is_authenticated:
        return redirect("/home/")
    
    form = CustomUserCreationForm(request.POST or None)
    if request.POST:
        if form.is_valid():
            form.save()
            user = form.login(request)
            
            login(request, user)
            return redirect("/home/")
    
    return render(request, 'accounts/auth/register.html', {'form': form})


def login_view(request):
    if request.user.is_authenticated:
        return redirect("/home/")
    
    form = LoginForm(request.POST or None)
    if request.POST and form.is_valid():
        user = form.login(request)
        
        if user:
            login(request, user)
            return redirect("/home/")
        
    return render(request, 'accounts/auth/login.html', {'form': form })


def logout_view(request):
    logout(request)
    
    return redirect('/accounts/login/')