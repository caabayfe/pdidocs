if (cancelled == "true") {
  response.sendRedirect("ldap_server_config_list.do");
} else {
  var worker = new GlideLDAPRefresh();
  worker.setProgressName("Refreshing users from LDAP ");
  worker.setBackground(true)
  worker.setServerID(server_id);
  worker.start();

  response.sendRedirect("ldap_refresh_status.do?sysparm_pworker_sysid=" 
    + worker.getProgressID());
}
