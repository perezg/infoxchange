#!/usr/bin/env python
from __future__ import print_function

import os
import sys
import platform
import subprocess
import shlex

def getOs():
  name = platform.linux_distribution()[0].lower()
  
  if(not name):
    if(platform.platform().lower().find("ubuntu")):
      name = "ubuntu"
    elif(platform.platform().lower().find("amzn")):
      name = "amazon"
    else:
      name = "unknown"
  
  return name

def myExec(command, printCommand = False, printOutput = False):
  if(printCommand):
    print("Executing %s" % command)
  
  output = subprocess.Popen(shlex.split(command.encode('ascii')), \
                              stderr=subprocess.STDOUT, \
                              stdout=subprocess.PIPE).communicate()[0]
  
  # Output is returned as a byte array, then I convert it to string
  output = output.decode("utf-8")
  
  if(printOutput):
    print("%s" % output)
    
  return output

def myExecPipe(pipe, command, printCommand = False, printOutput = False):
  if(printCommand):
    print("Executing %s | %s" % (pipe, command))
  
  pipeOutput = subprocess.Popen(shlex.split(pipe.encode('ascii')), \
                              stderr=subprocess.STDOUT, \
                              stdout=subprocess.PIPE)
  commandOutput = subprocess.Popen(shlex.split(command.encode('ascii')), \
                              stdin=pipeOutput.stdout, \
                              stderr=subprocess.STDOUT, \
                              stdout=subprocess.PIPE)
  
  pipeOutput.stdout.close()
  output = commandOutput.communicate()[0]
  pipeOutput.wait()
  
  # Output is returned as a byte array, then I convert it to string
  output = output.decode("utf-8")
  
  if(printOutput):
    print("%s" % output)
    
  return output

# Permissions can contain two parameters (filePermissions, dirPermissions)
def setPermissions(path, permissions = [664, 755], printCommand = False):
  if(printCommand):
    print("Changing permissions to %s" % path)
  
  filePermissions = permissions[0]
  dirPermissions = permissions[-1]
  command = "chmod"
    
  if(os.path.isdir(path)):
    #myExec('sudo %s %s %s' % (command, dirPermissions, path), printCommand, printCommand)
    # Change permissions on all the files under directory
    myExecPipe('sudo find %s -type d -print0' % path, 'xargs -0 sudo %s %s' % (command, dirPermissions), printCommand, printCommand)
    myExecPipe('sudo find %s -type f -print0' % path, 'xargs -0 sudo %s %s' % (command, filePermissions), printCommand, printCommand)    
  else:
    myExec('sudo %s %s %s' % (command, filePermissions, path), printCommand, printCommand)
  

def setOwner(path, owner, printCommand = False):
  print("Changing ownership to %s" % path)
  chProp(path, "chown", owner, printCommand)

def chProp(path, command, parameters, printCommand = False):
  myExec('sudo %s %s %s' % (command, parameters, path), printCommand, printCommand)
  
  if(os.path.isdir(path)):
    for root,dirs,files in os.walk(path):
      for obj in (files + dirs) :
        chProp(os.path.join(root,obj), command, parameters, printCommand)       

def publish(publish_dir, files, directories, header = "", permissions = [664, 755]):
  if(header):
    print("\n%s" % header)

  current_dir = myExec("pwd").strip()

  if(not os.path.exists(publish_dir)):
    print("Directory %s does not exists, creating it" % publish_dir)
    myExec("sudo mkdir -p %s" % publish_dir)
  
  for f in files:
    myExec('sudo cp %s %s' % (os.path.join(current_dir, f), publish_dir))
    setPermissions("%s" % os.path.join(publish_dir, f), permissions)
  
  for d in directories:
    myExec('sudo cp -fr %s %s' % (os.path.join(current_dir, d), publish_dir))
    setPermissions("%s" % os.path.join(publish_dir, d), permissions)

def softPublish(publish_dir, files, directories, header = "", permissions = [664, 755]):
  if(header):
    print("\n%s" % header)

  current_dir = myExec("pwd").strip()

  if(not os.path.exists(publish_dir)):
    print("Directory %s does not exists, creating it" % publish_dir)
    myExec("sudo mkdir -p %s" % publish_dir)
  
  for f in files:
    myExec('sudo ln -s %s %s' % (os.path.join(current_dir, f), os.path.join(publish_dir, f)))
    setPermissions("%s" % os.path.join(publish_dir, f), permissions)
    
  for d in directories:
    myExec('sudo ln -s %s %s' % (os.path.join(current_dir, d), os.path.join(publish_dir, d)))
    setPermissions("%s" % os.path.join(publish_dir, d), permissions)
  
def checkModules(modules):
  for module in modules:
    print("Checking if module %s is installed [" % (module), end="")
    output = myExec("perl -e 'use %s'" % (module))
    
    if(output == ""):
      print("OK]")
    else:
      print("Not OK]")
      
      print("Installing module")
      cpan(module)

execCpan = ''
def cpan(module):
  global execCpan
  if(execCpan == ""):
    # Check if cpanm exists
    output = myExec("whereis cpanm")
    if(output != "cpanm:"):
      print("cpanm found")
      execCpan = 'cpanm'
    else:
      print("cpanm not found, using cpan")
      execCpan = 'cpan'
  
  print("Installing module %s" % (module))
  myExec('sudo %s %s' % (execCpan, module))


def query_yes_no(question, default="yes"):
    """Ask a yes/no question via input() and return their answer.

    "question" is a string that is presented to the user.
    "default" is the presumed answer if the user just hits <Enter>.
        It must be "yes" (the default), "no" or None (meaning
        an answer is required of the user).

    The "answer" return value is one of "yes" or "no".
    """
    valid = {"yes":True,   "y":True,  "ye":True,
             "no":False,     "n":False}
    if default == None:
        prompt = " [y/n] "
    elif default == "yes":
        prompt = " [Y/n] "
    elif default == "no":
        prompt = " [y/N] "
    else:
        raise ValueError("invalid default answer: '%s'" % default)

    while True:
        sys.stdout.write(question + prompt)
        choice = raw_input().lower()
        if default is not None and choice == '':
            return valid[default]
        elif choice in valid:
            return valid[choice]
        else:
            sys.stdout.write("Please respond with 'yes' or 'no' "\
                             "(or 'y' or 'n').\n")