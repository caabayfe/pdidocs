if (current.changes()) {
	current.update();
}
// redirect to view dashboard
gs.setRedirect("/now/platform-analytics-workspace/scheduled-export" + current.sys_id);
