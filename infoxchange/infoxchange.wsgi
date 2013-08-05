import os
import site
import sys

path = os.path.realpath(os.path.join(os.path.dirname(__file__), '../'))

# Path to virtualenv
vepath = os.path.realpath(os.path.join(path, 'BASE'))

prev_sys_path = list(sys.path)

# add the site-packages of our virtualenv as a site dir
site.addsitedir(vepath)

# add the app's directory to the PYTHONPATH
sys.path.append(path)

# reorder sys.path so new directories from the addsitedir show up first
new_sys_path = [p for p in sys.path if p not in prev_sys_path]
for item in new_sys_path:
  sys.path.remove(item)
sys.path[:0] = new_sys_path

#print >> sys.stderr, sys.path

os.environ['DJANGO_SETTINGS_MODULE'] = 'infoxchange.settings'

import django.core.handlers.wsgi
_application = django.core.handlers.wsgi.WSGIHandler()

def application(environ, start_response):
    if environ['wsgi.url_scheme'] == 'https':
        environ['HTTPS'] = 'on'
    return _application(environ, start_response)