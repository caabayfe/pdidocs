(function executeRule(current, previous /*null when async*/) {

	var parComponentSysId = current.sys_id;
	if (!parComponentSysId) return;
	var canvasService = new GlideParDashboardWidgetService(parComponentSysId);
	var dashboardSysId = canvasService.getDashboardSysId();
	if (!dashboardSysId) return;
})(current, previous);
