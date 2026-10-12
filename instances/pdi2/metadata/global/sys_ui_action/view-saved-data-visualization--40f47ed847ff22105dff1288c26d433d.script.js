if (current.changes()) {
	current.update();
}
// redirect to view dashboard
gs.setRedirect("/now/platform-analytics-workspace/visualization-designer/" + current.sys_id);
