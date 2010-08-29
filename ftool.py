#! /bin/env python


import os, sys, pwd, grp

def usage():
  print 'usage :'
  print '  ', sys.argv[0], 'show dir'
  print '  ', sys.argv[0], 'chmod ddd fff dir'
  print '  ', sys.argv[0], 'chown user group dir'
  print '  ', sys.argv[0], 'delspace dir'

def route_show(arg, dirname, names):
  print '> enter : ', os.path.realpath(dirname)
  for name in names:
    print '  ',name

def route_chmod(arg, dirname, names):
  print '> enter :', dirname
  for name in names:
    abs_path = os.path.realpath(dirname+'/'+name)
    if not os.path.isdir(abs_path):
      print '  chmod', name
      os.chmod(abs_path, arg[0])
  print '< finally chmod', dirname
  os.chmod(os.path.realpath(dirname), arg[1])
  

def route_chown(arg, dirname, names):
  print '> enter :', dirname
  for name in names:
    abs_path = os.path.realpath(dirname+'/'+name)
    if not os.path.isdir(abs_path):
      print '  chown', name
      os.chown(abs_path, arg[0], arg[1])
  print '< finally chown', dirname
  os.chown(os.path.realpath(dirname), arg[0], arg[1])

def route_delspace(arg, dirname, names):
  print 'delspace'


def parse_none(argv):
  return ()

def parse_mod_flags(argv):
  return (int(argv[2], 8), int(argv[3], 8))

def parse_own_ids(argv):
  uid = pwd.getpwnam(argv[2]).pw_uid
  gid = grp.getgrnam(argv[3]).gr_gid
  return (uid, gid)


if __name__ == '__main__':
  # run_dir('bat-test')
  action_map = {'show':[route_show, 3, parse_none],
                'chmod':[route_chmod, 5, parse_mod_flags],
                'chown':[route_chown, 5, parse_own_ids],
                'delspace':[route_delspace, 3, parse_none]}

  try:
    action_profile = action_map[sys.argv[1]]
  except KeyError:
    usage()
    exit(0)
  except IndexError:
    usage()
    exit(0)

  #print 'action_map = ', action_map
  #print 'match.argc = ', action_profile[1]
  #print 'sys.argc = ', len(sys.argv)
  if len(sys.argv) != action_profile[1]:
    usage()
    exit(0)

  route = action_profile[0]
  parse = action_profile[2]
  path = os.path.realpath(sys.argv[action_profile[1] - 1])
  #print 'route = ', route
  #print 'path = ', path 
  os.path.walk(path, route, parse(sys.argv))
