(function executeRule(current, previous /*null when async*/) {

	var gr = new GlideRecord("sys_analytics_schema_cache");
	gr.addEncodedQuery("keySTARTSWITHbreakdown_metadata_");
	gr.query();
	while(gr.next()) {
		gr.setValue("evict", true);
		gr.update();
	}
	
})(current, previous);
