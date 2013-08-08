from django.http import HttpResponse
from django.shortcuts import render
import json


def home(request):
    return HttpResponse('<h1>hello</h1>')


def auth_options(request):
    response_data = {}

    return HttpResponse(json.dumps(response_data),
                        content_type="application/json")


def auth_test(request):
    return render(request,
                  'auth.html',
                  {},
                  content_type="text/html")
