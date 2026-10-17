function transform(input) {
	var resultObj = {};
	var query = input.query;
	
	if (query) {
		var util = new sn_cmdb_ws.CMDBWorkspaceUtil();
		var parsedQueryObj = util.parseBaseAggEncodedQuery(query);
		var chartId = parsedQueryObj.chartId;
		var tablesFromQuery = parsedQueryObj.tablesFromQuery;
		util.addBaseAggDataGroupByTableDetails(chartId, tablesFromQuery);
		var tableSysIds = Object.keys(tablesFromQuery);

		if (chartId == util.SUB_CATEGORY.RELATED_RECORDS && tableSysIds.length) {
			var tableInfo = tablesFromQuery[tableSysIds[0]];
			var tableName = tableInfo.name;
			var tableLabel = tableInfo.label;
			var relEntryObj = util.getCMDBRelatedEntryRefFields(tableName);

			resultObj[tableName] = {};
			resultObj[tableName].label = tableLabel;
			if (relEntryObj[tableName] && relEntryObj[tableName].length > 0) {
				resultObj[tableName].encodedQuery = util.buildCustomEncodedQuery(relEntryObj[tableName], util.OPERATORS.ISEMPTY, null, util.OPERATORS.OR);
			}
		} else if (chartId == util.SUB_CATEGORY.STALE_RECORDS) {
			resultObj[util.TABLES.CMDB_HEALTH_RESULT] = {
				label: gs.getMessage('Stale CIs'),
				encodedQuery: [util.STALENESS_METRIC_QUERY, util.rebuildTableCondition(util.COLS.CLASS_NAME, tablesFromQuery)].join('^')
			};
		} else if (chartId == util.SUB_CATEGORY.DUPLICATE_RECORDS) {
			resultObj[util.TABLES.CMDB_DUPLICATE_AUDIT_RESULT] = {
				label: gs.getMessage('Duplicate CIs'),
				encodedQuery: util.rebuildTableCondition(util.COLS.CI_SYS_CLASS_NAME, tablesFromQuery)
			};
		}
	}
	
	return resultObj;
}
