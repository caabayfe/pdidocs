(function executeRule(current, previous /*null when async*/) {

	var canvasSysId = current.canvas;
	if (!canvasSysId) return;
	var canvasService = new GlideParDashboardCanvasService(canvasSysId);
	var dashboardSysId = canvasService.getDashboardSysId();
	if (!dashboardSysId) return;
})(current, previous);
