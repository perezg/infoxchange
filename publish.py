#!/usr/bin/env python
from __future__ import print_function

import publishlib
import argparse
import os

def main():
  server = publishlib.getOs()

  options = {
    'apache': ( publishApache, [server] ),
    'source': ( publishEverything, [server, False] ),
    'all': ( publishEverything, [server, True] ),
  }

  parser = argparse.ArgumentParser(
    description='Publish script', 
    epilog='Running without parameters will publish only the source code (no virtualenv directory)')
  
  parser.add_argument('-apache', dest='callback', action='append_const', 
		      const=options['apache'], help='Publish all [source code, virtualenv, apache conf]')
  parser.add_argument('-source', dest='callback', action='append_const', 
		      const=options['source'], help='Publish only source code [no virtualenv or apache conf]')
  parser.add_argument('-all', dest='callback', action='append_const',
		      const=options['all'], help='Publish all [source code, virtualenv, apache conf]')
  
  args = parser.parse_args()
  if not args.callback:
    args.callback = [options['source']]
  
  for func, args in args.callback:
    func(*args) # * unpacks the array in order to use its items as arguments    
  
  restartApache(server)
  print("Publish finished")
  

def restartApache(server):
  print("Restarting apache")
  if(server == "ubuntu"):
    publishlib.myExec('sudo /opt/apache/restart', True)
  else:
    publishlib.myExec('sudo /sbin/service httpd restart', True)
  

def publishApache(server):
  apache_dirs = {
    'ubuntu' : "/opt/apache/conf/conf.d/",
  }
  
  apache_files = ['conf.d/1_mdt.conf']
  
  publishlib.publish(apache_dirs[server], apache_files, [], "Publishing apache conf")


def _deletePrevious(publishDir, objects, excluded):
  for obj in objects:
    if(not obj in excluded):
      publishlib.myExec("sudo rm -rf %s" % os.path.join(publishDir, obj))

def publishEverything(server, publishVE = True):
  publish_dirs = {
    'ubuntu' : "/var/www/html/python/infoxchange",
  }
  
  files = []
  directories = ['static', 'templates', 'infoxchange', 'store', 'api']
  publish_dir = publish_dirs[server]
  
  # Publish VirtualEnv directory
  if(publishVE):
    directories.append('BASE')
  
  print("Publishing files to %s (%s)" % (publish_dir, server))

  #if(publishlib.query_yes_no("Do you want to delete %s?" % publish_dir, 'no')):
  _deletePrevious(publish_dir, files + directories, [])

  # Publish
  publishlib.publish(publish_dir, files, directories, "Publishing infoxchange")
  

#####################################################################################

if __name__ == "__main__":
  main()