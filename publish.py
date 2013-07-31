#!/usr/bin/env python
from __future__ import print_function

import publishlib
import argparse

def main():
  server = publishlib.getOs()

  parser = argparse.ArgumentParser(description='Publish script', epilog="Running without parameters will publish everything")
  parser.add_argument('action', choices=['apache', 'all'])
  parser.set_defaults(action='all')
  args = parser.parse_args()
  
  if args.action == 'apache':
      publishApache(server)
  else:
      publishEverything(server)
      publishApache(server)
  
  print("Publish finished")
  

def publishApache(server):
  apache_dirs = {
    'ubuntu' : "/opt/apache/conf/conf.d/",
  }
  
  apache_files = ['conf.d/1_mdt.conf']
  
  publishlib.publish(apache_dirs[server], apache_files, [], "Publishing apache conf")
  
  print("Restarting apache")
  if(publishlib.getOs() == "ubuntu"):
    publishlib.myExec('sudo /opt/apache/restart', True)
  else:
    publishlib.myExec('sudo /sbin/service httpd restart', True)

  

def publishEverything(server):
  publish_dirs = {
    'ubuntu' : "/var/www/html/python/infoxchange",
  }
  
  files = ['index.py', 'manage.py']
  directories = ['images', 'static', 'infoxchange', 'store']
  publish_dir = publish_dirs[server]

  print("Publishing files to %s (%s)" % (publish_dir, server))

  if(publishlib.query_yes_no("Do you want to delete %s?" % publish_dir, 'no')):
      publishlib.myExec("sudo rm -rf %s" % publish_dir)

  # Publish
  publishlib.publish(publish_dir, files, directories, "Publishing infoxchange")
  

#####################################################################################

if __name__ == "__main__":
  main()