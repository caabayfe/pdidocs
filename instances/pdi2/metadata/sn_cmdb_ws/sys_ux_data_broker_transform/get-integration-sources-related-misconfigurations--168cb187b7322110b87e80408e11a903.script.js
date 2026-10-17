function transform(input) {
	var util = new sn_cmdb_ws.CMDBWorkspaceUtil();
	var resultObj = {};
	
	var integrationDataSources = [];
	var gr = new GlideRecord(util.TABLES.CMDB_INST_APPLICATION_FEED);
	gr.addActiveQuery();
	gr.addEncodedQuery(util.COLS.SYS_DATA_SOURCE + util.OPERATORS.NOTEQUAL + "null^"+ util.COLS.NAME + util.OPERATORS.NOTLIKE + util.IH_ETL_DEMODATA_PREFIX, false);
	gr.query();
	while (gr.next()) {
		integrationDataSources.push(gr.getValue(util.COLS.SYS_DATA_SOURCE));
	}
	
	var sourcesBatchImportOff = 0;
	gr = new GlideRecord(util.TABLES.SYS_DATA_SOURCE);
	gr.addEncodedQuery(util.COLS.SYS_ID + util.COLS.IN + integrationDataSources.join(","), false);
	gr.query();
	while (gr.next()) {
		var useBatchImport = gr.getValue(util.COLS.USE_BATCH_IMPORT);
		if (global.JSUtil.nil(useBatchImport) || useBatchImport == false) {
			sourcesBatchImportOff++;
		}
	}
	
	var totalSources = gr.getRowCount();
	resultObj["total_sources"] = totalSources;
	
	// Sources with batch processing turned off
	resultObj["sources_batch_import_off"] = sourcesBatchImportOff;
	resultObj["sources_batch_import_on"] = totalSources - sourcesBatchImportOff;
	var sourcesBatchImportOffPercent = 0;
	if (totalSources > 0) {
		sourcesBatchImportOffPercent = parseFloat((sourcesBatchImportOff / totalSources) * 100);
	}
	resultObj["sources_batch_import_off_percent"] = util.getDecimalNumberWithGivenScale(sourcesBatchImportOffPercent.toString()) + '%';
	resultObj["sources_batch_import_last_refreshed"] = new GlideDateTime().getDisplayValue();
	
	// Sources with concurrent import turned off
	var totalSourcesSchImportSet = 0;
	var sourcesConcurrentImportOff = 0;
	var sourcesWithNonCustomSizePartitionMethod = 0;
	gr = new GlideRecord(util.TABLES.SCHEDULED_IMPORT_SET);
	gr.addActiveQuery();
	gr.addEncodedQuery(util.COLS.DATA_SOURCE + util.COLS.IN + integrationDataSources.join(","), false);
	gr.query();
	while (gr.next()) {
		totalSourcesSchImportSet++;
		var concurrentImport = gr.getValue(util.COLS.CONCURRENT_IMPORT);
		if (global.JSUtil.nil(concurrentImport) || concurrentImport == false) {
			sourcesConcurrentImportOff++;
		}
		
		var partitionMethod = gr.getValue(util.COLS.PARTITION_METHOD);
		if (global.JSUtil.nil(partitionMethod) || partitionMethod != util.SCH_IMP_PARTITON_METHOD.CUSTOM_SIZE) {
			sourcesWithNonCustomSizePartitionMethod++;
		}
	}
	
	resultObj["total_sources_with_sch_import_set"] = totalSourcesSchImportSet;
	resultObj["sources_concurrent_import_off"] = sourcesConcurrentImportOff;
	resultObj["sources_concurrent_import_on"] = totalSourcesSchImportSet - sourcesConcurrentImportOff;
	
	var sourcesConcurrentImportOffPercent = 0;
	if (totalSourcesSchImportSet > 0) {
		sourcesConcurrentImportOffPercent = parseFloat((sourcesConcurrentImportOff / totalSourcesSchImportSet) * 100);
	}
	resultObj["sources_concurrent_import_off_percent"] = util.getDecimalNumberWithGivenScale(sourcesConcurrentImportOffPercent.toString()) + '%';
	resultObj["sources_concurrent_import_last_refreshed"] = new GlideDateTime().getDisplayValue();
	
	// Sources with non-custom size partition method
	resultObj["sources_non_custom_size_partition_method"] = sourcesWithNonCustomSizePartitionMethod;
	var sourcesWithNonCustomSizePartitionMethodPercent = 0;
	if (totalSourcesSchImportSet > 0) {
		sourcesWithNonCustomSizePartitionMethodPercent = parseFloat((sourcesWithNonCustomSizePartitionMethod / totalSourcesSchImportSet) * 100);
	}
	resultObj["sources_non_custom_size_partition_method_percent"] = util.getDecimalNumberWithGivenScale(sourcesWithNonCustomSizePartitionMethodPercent.toString()) + '%';
	resultObj["sources_non_custom_size_partition_method_last_refreshed"] = new GlideDateTime().getDisplayValue();
	
	return JSON.parse(JSON.stringify(resultObj));
}
