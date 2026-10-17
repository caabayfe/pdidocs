var HealthLicenseReportPopulator = Class.create();

var HEALTH_CI_TABLE = "itom_lu_health_ci";
var LICENSE_REPORT_TABLE = "itom_lu_licensable_cis";

var itomLicensingUtils = new sn_itom_license.ITOMLicensingUtils();
var metadata = new sn_itom_license.ITOMLicensingMetaData();
var batchUtil = new SNC.BatchCommandsUtil();
var utilScript = new UtilScript();

HealthLicenseReportPopulator.prototype = {
    initialize: function() {},

    populateReportTable: function() {
        var counter = 0;
        var total = 0;
        var jsonArr = [];
        var start = new Date().getTime();

        // update em_unique_nodes and itom_lu_health_ci with most recent data	
        if (!this.refreshData())
			return;

        var bulkSize = GlideProperties.getInt("evt_mgmt.batchInsertSingleField.bulk_size", 500);
        var suRatio = itomLicensingUtils.getCategory2Ratio();
        var ciConditions = utilScript.getAdditionalFiltersQuery(HEALTH_CI_TABLE, 'cmdb_ci', itomLicensingUtils.getHealthVSLabel());
        var maxRecords = itomLicensingUtils.getMaxResultsFor(itomLicensingUtils.getHealthVSLabel());
        var gr = new GlideRecord(HEALTH_CI_TABLE);
        if (!gs.nil(ciConditions))
            gr.addEncodedQuery(ciConditions);
        gr.query();

        //create array of json objects like these:
        //{"configuration_item":"12345678901233", "category":"server", "su_ratio":"1:1", "sys_domain":"global"}
        //or {"node_id":"someNode", "category":"Unresolved monitored objects","su_ratio":"1:1," "sys_domain":"global"}	
        while (gr.next()) {
            var jsonObj = {};
            if (!gs.nil(gr.cmdb_ci)) {
                var category = metadata.getCategory(gr.cmdb_ci.sys_class_name);
                if (gs.nil(category))
                    continue;
                var su_ratio = suRatio[category];
                if (gs.nil(su_ratio))
                    continue;
                jsonObj.configuration_item = '' + gr.cmdb_ci;
                jsonObj.sys_domain = '' + gr.cmdb_ci.sys_domain;
                jsonObj.value_stream = '' + 'Health';
                jsonObj.sku = itomLicensingUtils.skuSysId['itom'];
                jsonObj.category = category;
                jsonObj.su_ratio = su_ratio + ':1';
            } else if (!gs.nil(gr.node)) {
                jsonObj.node_id = '' + gr.node;
                jsonObj.sys_domain = '' + gr.sys_domain;
                jsonObj.value_stream = '' + 'Health';
                jsonObj.sku = itomLicensingUtils.skuSysId['itom'];
                jsonObj.category = metadata.getCategoryNameForUnknown();
				su_ratio = suRatio[jsonObj.category];
                if (gs.nil(su_ratio))
                    continue;
                jsonObj.su_ratio = su_ratio + ':1';
            }
            jsonArr.push(jsonObj);
            counter++;
            total++;
            if (total >= maxRecords)
                break;
            if (counter >= bulkSize) {
                if (itomLicensingUtils.isHealthJobCanceled())
					return;

				// 1. insert bulk into the target table
                batchUtil.batchInsertMultiple(JSON.stringify(jsonArr), LICENSE_REPORT_TABLE, '');
                // 2. set counter to 0
                counter = 0;
                // 3. re-init json array
                jsonArr = [];
            }
        }
        if (counter > 0) {
			if (itomLicensingUtils.isHealthJobCanceled())
				return;
            //insert rest of records in batch
            batchUtil.batchInsertMultiple(JSON.stringify(jsonArr), LICENSE_REPORT_TABLE, '');
        }
        var end = new Date().getTime();
        var perfJson = {};
        perfJson.script_name = 'HealthLicenseReportPopulator';
        this.writeToPerfTable(total, end - start, perfJson);
    },

    refreshData: function() {
		if (itomLicensingUtils.isHealthJobCanceled())
			return false;
        new EvtMgmtNodeCount().calculateNodeCount();
		if (itomLicensingUtils.isHealthJobCanceled())
			return false;
        new ITOMHealthLicenseCounter('report').process();
		if (itomLicensingUtils.isHealthJobCanceled())
			return false;
		return true;
    },

    writeToPerfTable: function(count, duration, json) {
        var doPerf = gs.getProperty('health_license_report_perf_on', false) == "true";
        if (!doPerf)
            return;
        var gr = new GlideRecord("sa_performance_statistics");
        gr.setValue("type", "healthLicensingProcess");
        gr.setValue("count", count);
        gr.setValue("duration", duration);
        gr.setValue("extra_data", JSON.stringify(json));
        gr.insert();
    },

    type: 'HealthLicenseReportPopulator'
};
