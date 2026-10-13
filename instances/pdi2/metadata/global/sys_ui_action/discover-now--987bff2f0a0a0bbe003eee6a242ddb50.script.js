var d = new Discovery();
var sys_id = d.discoveryFromCI(current.sys_id);
if (sys_id) {
   Discovery.throttlingInfoMessage();
   var url = "discovery_status_list.do?sysparm_query=sys_id=" + sys_id;
   action.setRedirectURL(url);
} else {
   gs.addInfoMessage(gs.getMessage('discover_ci_not_run'));
   action.setRedirectURL(current);
}
