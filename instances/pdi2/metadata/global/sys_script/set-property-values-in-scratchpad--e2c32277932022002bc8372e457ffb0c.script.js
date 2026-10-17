(function executeRule(current, previous /*null when async*/) {
	g_scratchpad.isCanvasActive = gs.getProperty('glide.cms.enable.responsive_grid_layout', 'true');
	g_scratchpad.isNewSharingActive = gs.getProperty('glide.cms.dashboards.sharing', 'true');
})(current, previous);
