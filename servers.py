#!/usr/bin/env python3

import os
import sys
import getopt

import subprocess
import shlex

def usage():
  usage = """
  servers.py -s SERVER -a start|stop|restart
  Usage:
    -h --help                 Prints this help
    -a --action               Action to perform (stop|start|restart)
    -s --server               all|jenkins|glassfish|apache
                              By default all
  """
  print(usage)

def doServer(server, action):
  servers = [
    ['jenkins',   '/etc/init.d/jenkins ACTION'],
    ['glassfish', '/opt/glassfish/bin/asadmin ACTION-domain domain1'],
    ['tomcat',    'sh ' + os.environ['CATALINA_HOME'] + '/bin/catalina.sh ACTION'],
    ['apache',    'service apache2 ACTION'],
    ['postgresql', 'sudo /etc/init.d/postgresql ACTION'],
  ]
  
  if(action == "restart"):
    doServer(server, 'stop')
    action = 'start'
  
  if(action == "start"):
    servers.reverse
    
  prc = ''
  
  for s in servers:
    if(server == s[0] or server == "all"):
      prc = s[1].replace("ACTION", action)
      
      print("Executing %s as root" % (prc))
      subprocess.call(shlex.split('sudo ' + prc))
  
  if(prc == ''):
    print('Server name not recognized')


def main(argv):
  server = 'all'
  action = ''
  
  try:
    opts, args = getopt.getopt(argv,"ha:s:",["help","server=","action="])
  except getopt.GetoptError:
    usage()
    sys.exit(2)
  for opt, arg in opts:
    if opt == '-h':
      usage()
      sys.exit()
    elif opt in ("-s", "--server"):
      server = arg
    elif opt in ("-a", "--action"):
      action = arg

  if(action == ""):
    print("Error: Action not especified")
    usage()
    sys.exit(2)
    
  doServer(server, action)

#####################################################################################

if __name__ == "__main__":
  main(sys.argv[1:])

