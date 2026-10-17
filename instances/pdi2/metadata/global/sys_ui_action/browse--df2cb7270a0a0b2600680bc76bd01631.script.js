current.update();
gs.include("LDAPUtils");
var l = new LDAPUtils();
var r = l.testOUConnection(current);
if (!r) {
   gs.addErrorMessage(gs.getMessage("Error connecting to server"));
   action.setRedirectURL(current);
} else
   action.setRedirectURL("ldapbrowse.do?sysparm_server_id=" + current.server + "&sysparm_rdn=" + encodeURIComponent(current.ou) + "&sysparm_filter=" + encodeURIComponent(current.filter.toString()));
