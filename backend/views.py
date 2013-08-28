from django.http import HttpResponse
from django.shortcuts import render
import json


def home(request):
    return HttpResponse('<h1>hello</h1>')


def auth_test(request):
    return render(request,
                  'auth.html',
                  {},
                  content_type="text/html")

def logged-in(request):
    return render(request,
                 'auth.html',
                 {'session': request.session},
                 content_type='text/html')
