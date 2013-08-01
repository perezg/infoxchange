# Create your views here.
from django.shortcuts import render
import datetime
 
def home(request):
    now = datetime.datetime.now()

    return render(request, 'home/home.html', {'current_date': now})