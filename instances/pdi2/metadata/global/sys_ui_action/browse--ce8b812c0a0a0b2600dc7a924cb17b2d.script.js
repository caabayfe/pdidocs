current.update();
gs.include("LDAPUtils");
var l = new LDAPUtils();
var r = l.testServerConnection(current);
if (!r) {
   gs.addErrorMessage(gs.getMessage("Error connecting to server"));
   action.setRedirectURL(current);
} else
   action.setRedirectURL("ldapbrowse.do?sysparm_server_id=" + current.sys_id.toString() + "&sysparm_filter=&sysparm_rdn=");
