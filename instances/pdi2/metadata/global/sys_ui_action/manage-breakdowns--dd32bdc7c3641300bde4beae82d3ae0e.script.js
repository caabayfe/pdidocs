// if there are changes to the form then save before redirecting.
if (current.changes()) {
    current.update();
}
// redirect to Manage Breakdowns
var url = "$pa_manage_breakdown.do?sys_id=" + current.sys_id + "&sysparm_stack=no";
//sysparm_stack=no is added to avoid adding the manage breakdwowns page url to navigation stack
gs.setRedirect(url);
