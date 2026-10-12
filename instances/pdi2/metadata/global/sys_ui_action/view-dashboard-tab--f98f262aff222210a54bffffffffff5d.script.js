// if there are changes to the form then save before redirecting.
if (current.changes()) {
	current.update();
}

// redirect to view dashboard
gs.setRedirect("/now/platform-analytics-workspace/dashboards/params/edit/false/tab-sys-id/" + current.sys_id + "/sys-id/" + current.dashboard+ "/filter/" + new Date().getTime());
