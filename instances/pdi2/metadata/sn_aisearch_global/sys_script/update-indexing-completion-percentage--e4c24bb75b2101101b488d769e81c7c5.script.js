(function executeRule(current) {
    var m2mGR = new GlideRecord("sn_aisearch_global_job_ingest_history");
    m2mGR.addQuery("sn_aisearch_global_migration_job", current.getUniqueValue());
    m2mGR.query();
    while (m2mGR.next()) {
		if (("" + m2mGR.ais_ingest_datasource_stats.state) !== "indexed") {
			var recordCount = m2mGR.getValue("total_record_count");
			var percent = 0;
			if (recordCount && recordCount > 0) percent = (m2mGR.ais_ingest_datasource_stats.records_processed/recordCount) * 100;
			m2mGR.setValue("percent_complete", percent);
			m2mGR.update();
		} else if (m2mGR.getValue("percent_complete") !== "100") {
			m2mGR.setValue("percent_complete", 100);
			m2mGR.update();
		}
    }
})(current);
