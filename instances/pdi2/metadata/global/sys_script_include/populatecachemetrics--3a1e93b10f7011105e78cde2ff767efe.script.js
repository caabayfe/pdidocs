var PopulateCacheMetrics = Class.create();
PopulateCacheMetrics.prototype = {
	initialize: function() {
	},
	
	populate: function() {
		if (gs.getProperty("com.glide.app_insights_utils.cache_metrics_enable", "false") !== "true")
			return;

		var stats = new GlideXMLStats();

		var xmldoc = new XMLDocument2();
		xmldoc.parseXML(stats.toStringWithInclude("cache_metrics"));
		var caches = xmldoc.getNode("//cache_metrics");

		var iter = caches.getChildNodeIterator();

		var grNode = new GlideRecord('sys_cluster_state');
		grNode.addQuery('node_id', gs.getNodeID());
		grNode.query();
		grNode.next();

		while (iter.hasNext()) {
			var cache = iter.next();

			var gr = new GlideRecord('cache_metrics');
			gr.addQuery('node', gs.getNodeID());
			gr.addQuery('cache_name', cache.getNodeName());
			gr.query();

			var existingRecord = gr.next();

			if (!existingRecord) {
				gr.initialize();
			}

			gr.avg_sql_ms = cache.getAttribute("avg_sql_ms");
			gr.avg_time_ms = cache.getAttribute("avg_time_ms");
			gr.flushes = cache.getAttribute("flushes");
			gr.hit_ratio = cache.getAttribute("hit_ratio");
			gr.puts = cache.getAttribute("puts");
			gr.queries = cache.getAttribute("queries");
			gr.cache_name = cache.getNodeName();
			gr.node = grNode.sys_id;

			if (existingRecord) {
				gr.update();
			} else {
				gr.insert();
			}
		}
	},

	type: 'PopulateCacheMetrics'
};
