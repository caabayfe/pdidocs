// if there are changes to the form then save before redirecting.
if (current.changes()) {
	current.update();
}
// redirect to view dashboard
gs.setRedirect("now/platform-analytics-workspace/dashboards/params/edit/false/sys-id/" + current.sys_id + "/filter/" + new Date().getTime());
