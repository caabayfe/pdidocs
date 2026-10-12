function transform(input) {
	var util = new sn_cmdb_ws.CMDBWsInsightUtil();
	var result = {
		errors: [],
		listRefresh: {}
	};
	
	var ciClass = input.ci_class;
	var type = input.type;
	var cloudProvider = input.cloud_provider;
	var selectedTabIndex = input.selected_tab_index;
	
	var dataCenterClass = "";
	var query = {};
	
	query[util.COLS.CI_CLASS] = ciClass;
	if (!ciClass) {
		result.errors.push("Input parameter - CI Class is missing");
	} else if (!util.isValidRecord(util.TABLES.SN_CMDB_WS_QUERY_CATEGORY, null, query)) {
		result.errors.push("Invalid input parameter - CI Class");
	}
	
	if (selectedTabIndex == 0) {
		query = {};
		query[util.COLS.NAME] = util.TABLES.SN_CMDB_WS_DATACENTER_TYPE;
		query[util.COLS.ELEMENT] = util.COLS.TYPE 
		query[util.COLS.VALUE] = type;
		if (!type) {
			result.errors.push("Input parameter - Type is missing");
		} else if (!util.isValidRecord(util.TABLES.SYS_CHOICE, null, query)) {
			result.errors.push("Invalid input parameter - Type");
		}
	} else if (selectedTabIndex == 1) {
		query = {};
		query[util.COLS.CLOUD_PROVIDER] = cloudProvider;
		if (!cloudProvider) {
			result.errors.push("Input parameter - Cloud Provider is missing");
		} else if (cloudProvider !== util.NONCLOUD_AS_PROVIDER && !util.isValidRecord(util.TABLES.SN_CMDB_WS_DATACENTER_TYPE, null, query)) {
			result.errors.push("Invalid input parameter - Cloud provider");
		}
	}
	
	// Get the count of CI categories
	result.ci_classes = util.getCIClasses();
	result.ci_classes_count = util.getCIClasses().length;
	
	// List information shouldn't be returned if there are errors.
	if (result.errors.length == 0) {
		if (cloudProvider) {
			// Setting type to "non_cloud" by default for "Non-cloud" cloud provider case, as the corresponding record doesn't exist in datacenter type table.
			type = util.DATACENTER_TYPE.NONCLOUD;
			var grDataCenterType = util.getDataCenterTypeOfCloudProvider(cloudProvider);
			if (grDataCenterType.next()) {
				type = grDataCenterType.getValue(util.COLS.TYPE);
				dataCenterClass = grDataCenterType.getValue(util.COLS.DATACENTER_CLASS);
			}
		}
		
		var gr = new GlideRecord(util.TABLES.SN_CMDB_WS_QUERY_CATEGORY);
		gr.addQuery(util.COLS.CI_CLASS, ciClass);
		gr.addQuery(util.COLS.TYPE, type);
		gr.query();

		if (gr.next()) {
			var savedQueryId = gr.getValue("query");
			var typeLabel = gr.getDisplayValue(util.COLS.TYPE);
			var latestExecutionDataObj = util.getQueryLatestExecutionData(savedQueryId);

			if (latestExecutionDataObj.status === util.QB_STATUS.COMPLETE) {
				result.listTable = latestExecutionDataObj.result_table;
				result.listFixedFilter = "query=" + latestExecutionDataObj.executionId;

				if (cloudProvider) {
					if (dataCenterClass) {
						var baseFilter = "query=" + latestExecutionDataObj.executionId;
						//needs a different field for cloud service account, since its query doesn't have a logical datacenter
						var dcField = (gr.getUniqueValue() === util.CLOUD_SERVICE_ACC_CATEGORY)
							? util.CLOUD_SERVICE_ACC_DC_TYPE_FIELD
							: util.DC_CLASS_FIELD;
						result.listFixedFilter = baseFilter + "^" + dcField + "=" + dataCenterClass;
					}
					result.listTitle = gs.getMessage("{0} - {1}", [ciClass, cloudProvider]);

				} else { 
					result.listTitle = gs.getMessage("{0} - {1}", [ciClass, typeLabel]);
				}
				result.listRefresh.timestamp = new GlideDateTime().getNumericValue();
			} else {
				result.errors.push("Latest execution did not complete successfully");
			}
		} else {
			result.errors.push("Error while getting results table information");
		}
	}
	
	return result;
}
