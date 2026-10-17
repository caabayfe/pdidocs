function() {  /* widget controller */
	var c = this;

	c.trackPage = function() {
		window.GlideWebAnalytics.trackEvent("Service Catalog", "Catalog Search Widget", "Search Widget Loaded");
	}
}
