(function executeRule(current) {
    var recordCount = 0;
	var fDatasourceFilter = new sn_ais.AisUtil().getTableLevelAttribute(current.ais_ingest_datasource_stats.datasource.source, 'filter', '');
	var count = new GlideAggregate(current.ais_ingest_datasource_stats.datasource);
	count.addAggregate('COUNT');
	count.addEncodedQuery(fDatasourceFilter);
	if (current.ais_ingest_datasource_stats.datasource.retention_policy) count.addEncodedQuery("sys_updated_on>=javascript:gs.daysAgo(" + current.ais_ingest_datasource_stats.datasource.retention_policy.days + ")");
	count.query();
	if (count.next()) {
		recordCount = count.getAggregate('COUNT');
	}
	current.setValue("total_record_count", recordCount);
})(current);
