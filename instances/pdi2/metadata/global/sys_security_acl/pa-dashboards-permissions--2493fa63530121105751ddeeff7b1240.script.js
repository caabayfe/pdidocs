var unifiedEnabled = gs.getProperty('com.glide.par.unified_analytics.enabled', 'false') === 'true';
if (unifiedEnabled) {
	var gr = new GlideRecord("pa_dashboards");
	if (gr.get(current.dashboard)) {
		answer = gr.canRead();
	}
}
answer = false;
