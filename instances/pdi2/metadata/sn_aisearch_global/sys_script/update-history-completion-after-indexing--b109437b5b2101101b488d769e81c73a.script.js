(function executeRule(current) {
	var indexingComplete = false;
    var m2mGR = new GlideRecord("sn_aisearch_global_job_ingest_history");
    var indexHistoryGR = new GlideRecord("ais_ingest_datasource_stats");
    m2mGR.addQuery("sn_aisearch_global_migration_job", current.getUniqueValue());
    m2mGR.query();
    if (m2mGR.hasNext()) indexingComplete = true;
    while (m2mGR.next()) {
		if (m2mGR.getValue("percent_complete") !== "100") {
			m2mGR.setValue("percent_complete", 100);
			m2mGR.update();
		}
    }
})(current);
