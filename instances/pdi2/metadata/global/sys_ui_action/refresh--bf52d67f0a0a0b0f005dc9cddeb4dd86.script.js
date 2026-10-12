function clickActivate() {
  // the following is what we have to do to make this client
  // script work from a list and form, with today's code
  if (typeof rowSysId == 'undefined')
     sysId = gel('sys_uniqueValue').value;
  else
     sysId = rowSysId;

  var gr = new GlideRecord("ldap_server_config");
  gr.addQuery("sys_id", sysId);
  gr.query();
  if(gr.next()) {
    var map = new GwtMessage().getMessages(["LDAP Refresh", "Server not found"]);
    var dd = new GlideDialogWindow("dialog_ldap_refresh");
    dd.setTitle(map["LDAP Refresh"]);
    dd.setTitle(map["LDAP Refresh"] + " '" + gr.name + "' ?");
    dd.setPreference('sysparm_server_id', gr.sys_id);
    dd.setPreference('sysparm_server_name', gr.name);
    dd.render();
  } else {
    alert(map["Server not found"] + ": " + sysId);
  }
}
