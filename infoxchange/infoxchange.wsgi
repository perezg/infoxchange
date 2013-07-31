import os
import sys

path = os.path.realpath(os.path.join(os.path.dirname(__file__), '../'))
if path not in sys.path:
    sys.path.append(path)
   
print >> sys.stderr, sys.path

os.environ['DJANGO_SETTINGS_MODULE'] = 'infoxchange.settings'

import django.core.handlers.wsgi
_application = django.core.handlers.wsgi.WSGIHandler()

def application(environ, start_response):
    if environ['wsgi.url_scheme'] == 'https':
        environ['HTTPS'] = 'on'
    return _application(environ, start_response)