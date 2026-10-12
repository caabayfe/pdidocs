

// reclassify to server based on operating system, you may use any criteria that is suitable
if (source.operating_system == "AIX" ||
    source.operating_system == "HP/UX" ||
    source.operating_system == "Solaris" ||
    source.operating_system == "AIX")
  target.sys_class_name = "cmdb_ci_unix_server";

if (source.operating_system == "Windows 2000 Server" ||
    source.operating_system == "Windows 2003 Server" ||
    source.operating_system == "Windows NT 4.0")
  target.sys_class_name = "cmdb_ci_win_server";

if (source.operating_system == "OS/400" ||
    source.operating_system.toString().indexOf("Linux") >= 0)
  target.sys_class_name = "cmdb_ci_server";
