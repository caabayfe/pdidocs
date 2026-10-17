(function executeRule(current, previous /*null when async*/) {

	var analyticsVisualization = new GlideRecord('analytics_visualization');
	if (analyticsVisualization.get(current.sys_id)) {
		analyticsVisualization.name = current.title;
		analyticsVisualization.update();
	}

})(current, previous);
