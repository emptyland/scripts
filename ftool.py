#! /bin/env python


import os, sys, pwd, grp, re

def usage(comment = None):
  exit_code = 0
  if comment:
    print comment
    exit_code = 127
  print 'usage :'
  print '  ', sys.argv[0], 'show dir'
  print '  ', sys.argv[0], 'chmod dirmode filemode dir'
  print '  ', sys.argv[0], 'chown user group dir'
  print '  ', sys.argv[0], 'rspace dir'
  print '  ', sys.argv[0], 'genbkg static transition dir'
  exit(exit_code)


def fatal(comment):
  print comment
  exit(127)


#
# Walk routes :
#
def route_show(arg, dirname, names):
  """Just show all files/directory
  """
  print '> enter : ', os.path.realpath(dirname)
  for name in names:
    print '  ',name


def route_chmod(arg, dirname, names):
  """chmod files,
  arg[0] : file's mode.
  arg[1] : directory's mode."""
  print '> enter :', dirname
  for name in names:
    abs_path = os.path.realpath(dirname+'/'+name)
    if not os.path.isdir(abs_path):
      print '  chmod', name
      os.chmod(abs_path, arg[0])
  print '< finally chmod', dirname
  os.chmod(os.path.realpath(dirname), arg[1])
  

def route_chown(arg, dirname, names):
  """change files/direcory's owner,
  arg[0] : uid
  arg[1] : gid"""
  print '> enter :', dirname
  for name in names:
    abs_path = os.path.realpath(dirname+'/'+name)
    if not os.path.isdir(abs_path):
      print '  chown', name
      os.chown(abs_path, arg[0], arg[1])
  print '< finally chown', dirname
  os.chown(os.path.realpath(dirname), arg[0], arg[1])


def route_rspace(arg, dirname, names):
  """replace filename's space to '_'.
  """
  print '> enter :', dirname
  for name in names:
    abs_path = os.path.realpath(dirname + '/' + name)
    if not os.path.isdir(abs_path) and name.count(' ') > 0:
      new = name.replace(' ', '_')
      print '  mv', '"' + name + '"', '"' + new + '"'
      # Must use the real(abs) path.
      abs_new_path = os.path.realpath(dirname + '/' + new)
      os.rename(abs_path, abs_new_path)
  if dirname.count(' '):
    new = dirname.replace(' ', '_')
    print '< finally mv', dirname, new
    abs_path = os.path.realpath(dirname)
    abs_new_path = os.path.realpath(new)
    os.rename(dirname, new)
  else:
    print '< leave', dirname


def route_genbkg(arg, dirname, names):
  """generate gnome backgroud goup's xml file.
  arg[0] : static seconds, float number
  arg[1] : transition seconds, float number
  arg[2] : xml document object
  """
  pass

#
# Arguments Parsers:
#
def parse_none(argv):
  """A none route dummy
  """
  return ()


def parse_mod_flags(argv):
  pattern = '[0-7][0-7][0-7]'
  if not re.match(pattern, argv[2]):
    usage('Arguments error : ' + argv[2] + '.')
  if not re.match(pattern, argv[3]):
    usage('Arguments error : ' + argv[3] + '.')
  return (int(argv[2], 8), int(argv[3], 8))


def parse_own_ids(argv):
  try:
    uid = pwd.getpwnam(argv[2]).pw_uid
    gid = grp.getgrnam(argv[3]).gr_gid
  except KeyError:
    fatal('Miss user/group name.')
  return (uid, gid)


def parse_bkg_seconds(argv):
  pattern = '\d{1,}\.\d{1,}'
  if not re.match(pattern, argv[2]):
    usage('Arguments error : ' + argv[2] + '.')
  if not re.match(pattern, argv[3]):
    usage('Arguments error : ' + argv[3] + '.')
  return (float(argv[2]), float(argv[3]))


if __name__ == '__main__':
  # Actions profile mapping.
  action_map = {'show':[route_show, 3, parse_none],
                'chmod':[route_chmod, 5, parse_mod_flags],
                'chown':[route_chown, 5, parse_own_ids],
                'rspace':[route_rspace, 3, parse_none],
                'genbkg':[route_genbkg, 5, parse_bkg_seconds]}
  # Check "argc" and "argc"
  try:
    action_profile = action_map[sys.argv[1]]
  except KeyError:
    usage('Miss action ' + sys.argv[1] + '.')
  except IndexError:
    usage('No action.')
  if len(sys.argv) != action_profile[1]:
    usage('Miss arguments.')
  route = action_profile[0]
  parse = action_profile[2]
  path = os.path.realpath(sys.argv[action_profile[1] - 1])
  try:
    os.path.walk(path, route, parse(sys.argv))
  except OSError as e:
    fatal(str(e))
