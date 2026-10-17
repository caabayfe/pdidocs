gs.include('EvtMgmtCommons');


var enableLog = true;
// tables
var HEALTH_CI_TABLE = "itom_lu_health_ci";
var EM_UNIQUE_NODES = "em_unique_nodes";
var LICENSE_CENTRAL_TABLE = "itom_lu_ci_counts";
var SN_OCC_LICENSE_NODES = "sn_occ_license_node";
// constants
var HEALTH_VALUE_STREAM = "Health";
var CMDB_CI = "cmdb_ci";
var CLASS_NAME_DOT_WALK = CMDB_CI + ".sys_class_name";
var DUPLICATE_FIELD_DOT_WALK = CMDB_CI + ".duplicate_of";
var INSTALL_STATUS_DOT_WALK = CMDB_CI + ".install_status";
var DOMAIN_DOT_WALK = CMDB_CI + ".sys_domain";
var CMDB_CI_RETIRED = "7";
var CMDB_CI_STOLEN = "8";
var CMDB_CI_ABSENT = "100";
var EXCLUDE_CI_LIST = [CMDB_CI_RETIRED, CMDB_CI_STOLEN, CMDB_CI_ABSENT];
var NODE = "node";
var OTOM_SKU_TYPE = "otm";
var ITOM_SKU_TYPE = "itom";

var HEALTH_EXCLUSIONS_SUFFIX = "_health_exclusions";
// utils
var itomLicensingUtils = new sn_itom_license.ITOMLicensingUtils();
var metadata = new sn_itom_license.ITOMLicensingMetaData();
var batchUtil = new SNC.BatchCommandsUtil();
//global variables
var perfJson = {};
var totalInserted = 0;
gs.include('SlowStepJSManager');
var ITOMHealthLicenseCounterWithOTOM = Class.create();
ITOMHealthLicenseCounterWithOTOM.prototype = {
    initialize: function(mode) {
		this.isReport = (!gs.nil(mode) && mode == 'report') ? true : false;
        this.slowStepsManager = new SlowStepJSManager();
        var prefix = "ITOM_Licensing_Health_Processor_Slow_Steps ";
        var isSlowStepOn = gs.getProperty("enable_analytics_pattern_alert_slow_steps", "true") === 'true';
        this.slowStepsManager.initialize(prefix, isSlowStepOn);
        this.evtMgmtCommons = new EvtMgmtCommons();
    },
    logMessage: function(message) {
        if (enableLog) {
            gs.log("ITOMHealthLicenseCounterWithOTOM - " + message);
        }
    },
    deletePreviousCIs: function() {
        this.logMessage("Truncating itom_lu_health_ci table");
        var dbi = GlideDBConfiguration.getDBI(HEALTH_CI_TABLE);
        dbi.truncateTable(HEALTH_CI_TABLE);
        dbi.close();
    },
    populateOccultusCIs: function() {
        this.logMessage("Populating Occultus CIs");
        var occTotal = 0;
        var bulkSize = GlideProperties.getInt("sn_occ.batchInsertSingleField.bulk_size", 500);
        var gr = this.queryForNotNullCis(SN_OCC_LICENSE_NODES);
        occTotal += parseInt(this.saveData(gr, bulkSize, true));
        gr = this.queryForNullCis(SN_OCC_LICENSE_NODES);
        occTotal += parseInt(this.saveData(gr, bulkSize, true));
        totalInserted += occTotal;
        perfJson.occInserted = occTotal;
        this.logMessage("Occultus processed total records: " + occTotal);
    },
    populateEMCIs: function() {
        this.logMessage("Populating EM CIs");
        var emTotal = 0;
        var bulkSize = GlideProperties.getInt("evt_mgmt.batchInsertSingleField.bulk_size", 500);
        //get all records from em_unique_nodes table where cmdb not duplicated, cmdb_ci is not null and installed status not in the excluded list of status
        var gr = this.queryForNotNullCis(EM_UNIQUE_NODES);
        emTotal += parseInt(this.saveData(gr, bulkSize));
        gr = this.queryForNullCis(EM_UNIQUE_NODES);
        emTotal += parseInt(this.saveData(gr, bulkSize));
        totalInserted += emTotal;
        perfJson.emInserted = emTotal;
        this.logMessage("EM processed total records: " + emTotal);
    },
    queryForNullCis: function(table) {
        var gr = new GlideRecord(table);
        gr.addNullQuery(CMDB_CI);
        gr.query();
        return gr;
    },
    queryForNotNullCis: function(table) {
        var gr = new GlideRecord(table);
        gr.addNotNullQuery(CMDB_CI);
        gr.addNullQuery(DUPLICATE_FIELD_DOT_WALK);
        gr.addQuery(INSTALL_STATUS_DOT_WALK, "NOT IN", EXCLUDE_CI_LIST);
        gr.query();
        return gr;
    },
    saveData: function(gr, bulkSize, shouldDeduplicate) {
        var counter = 0;
        var total = 0;
        var jsonArr = [];
        var node, cmdbCi;
        //create array of json objects like these:
        //{"cmdb_ci":"12345678901233", "ci_node_hash":"12345678901233","sys_domain":"global"}
        //or {"node":"someNode", "ci_node_hash":"someNode_global","sys_domain":"global"}
        while (gr.next()) {
            var jsonObj = {};
            node = gr.node;
            cmdbCi = gr.cmdb_ci;
            if (JSUtil.nil(cmdbCi) && JSUtil.nil(node))
                continue;
            if (!JSUtil.nil(node)) {
                jsonObj.node = '' + node;
                jsonObj.ci_node_hash = node + '@' + gr.node_domain;
                jsonObj.sys_domain = '' + gr.node_domain;
            }
            if (!JSUtil.nil(cmdbCi)) {
                jsonObj.cmdb_ci = '' + cmdbCi;
                jsonObj.ci_node_hash = '' + cmdbCi;
                jsonObj.sys_domain = '' + gr.cmdb_ci.sys_domain;
            }
            jsonArr.push(jsonObj);
            counter++;
            total++;
            if (counter >= bulkSize) {
                // 0. Remove duplicate CIs which are already present in the health ci table
                if (shouldDeduplicate)
                    jsonArr = this.deDuplicateCis(jsonArr);
                // 1. insert bulk into the target table
                batchUtil.batchInsertMultiple(JSON.stringify(jsonArr), HEALTH_CI_TABLE, '');
                // 2. set counter to 0
                counter = 0;
                // 3. re-init json array
                jsonArr = [];
            }
        }
        if (counter > 0) {
            //insert rest of records in batch
            batchUtil.batchInsertMultiple(JSON.stringify(jsonArr), HEALTH_CI_TABLE, '');
        }
        return total;
    },
    deDuplicateCis: function(ciList) {
        var ciHashMap = {};
        var dedupedCiList = [];
        for (var i = 0; i < ciList.length; i++)
            ciHashMap[ciList[i].ci_node_hash] = ciList[i];
        var dedupGr = new GlideRecord(HEALTH_CI_TABLE);
        dedupGr.addQuery('ci_node_hash', 'IN', Object.keys(ciHashMap).join(','));
        dedupGr.query();
        while (dedupGr.next())
            delete ciHashMap[dedupGr.getValue('ci_node_hash')];
        for (var ciHash in ciHashMap)
            dedupedCiList.push(ciHashMap[ciHash]);
        return dedupedCiList;
    },
    populateOICIs: function() {
        this.logMessage("Populating OI CIs");
        var oiInsertedRecords = SNC.MetricScriptableApis.populateLicenseCIs();
        perfJson.oiInserted = oiInsertedRecords;
        this.logMessage("OI processed total records: " + oiInsertedRecords);
    },
    populateCentralTable: function(skuTypeGr) {
		if(this.isReport)
			return;
		
		var skuType = skuTypeGr.getValue('sku');
        var skuTypeSysId = skuTypeGr.getValue('sys_id');
		
        this.logMessage("Populating Central table");
        // Initialize the json count
		var countsJson = itomLicensingUtils.getCountsJsonTemplate(HEALTH_VALUE_STREAM.toLowerCase(), skuType);
        // Get a count from each ci_type per Domain
        var ciTypeCountsPerDomain = this.getCiCountByTypeAndDomain(skuType);
		
        var countsJsonPerDomain = [];
        for (var i = 0; i < ciTypeCountsPerDomain.length; i++) {
            var licCountRec = ciTypeCountsPerDomain[i];
            var domainId = licCountRec['domain'];
            if (!countsJsonPerDomain[domainId]) {
                countsJsonPerDomain[domainId] = itomLicensingUtils.getCountsJsonTemplate(HEALTH_VALUE_STREAM.toLowerCase(), skuType);
            }
            var ciTypes = Object.keys(licCountRec);
            var domainIndex = ciTypes.indexOf('domain');
            if (domainIndex != -1)
                ciTypes.splice(domainIndex, 1);
            var ciTypeToCategory = metadata.getCategories(ciTypes);
            var ciTypeKeys = Object.keys(ciTypeToCategory);
            var category;
            for (var j = 0; j < ciTypeKeys.length; j++) {
                category = ciTypeToCategory[ciTypeKeys[j]];
                if (category && category != '') {
                    if (!countsJsonPerDomain[domainId][category])
                        countsJsonPerDomain[domainId][category] = 0;
                    countsJsonPerDomain[domainId][category] = parseInt(countsJsonPerDomain[domainId][category]) + parseInt(ciTypeCountsPerDomain[i][ciTypeKeys[j]]);
                }
            }
        }
		//we want to count unknown nodes only for itom, not relevant for otom
		if(skuType == ITOM_SKU_TYPE) {
			var unknownCategory = metadata.getCategoryNameForUnknown();
			var unknownNodesPerDomain = this.countUnknownDevicesPerDomain();
			for (var domainName in unknownNodesPerDomain) {
				if (!countsJsonPerDomain[domainName])
					countsJsonPerDomain[domainName] = {};
				countsJsonPerDomain[domainName][unknownCategory] = parseInt(unknownNodesPerDomain[domainName]);
			}
		}
        // Go through the category counts and prepare a json array to insert into central table
        //{"category":"x", "value_stream":"Health","count":"y"}
        var jsonArr = [];
        for (var domain in countsJsonPerDomain) {
            var categoryCountKeys = Object.keys(countsJsonPerDomain[domain]);
            for (j = 0; j < categoryCountKeys.length; j++) {
                var jsonCountRecord = {};
                category = categoryCountKeys[j];
                var count = countsJsonPerDomain[domain][category];
                jsonCountRecord.category = category;
                jsonCountRecord.count = "" + count;
                jsonCountRecord.value_stream = HEALTH_VALUE_STREAM;
                jsonCountRecord.is_aggregated = "" + false;
                jsonCountRecord.sys_domain = domain;
				jsonCountRecord.sku = skuTypeSysId;
                jsonArr.push(jsonCountRecord);
            }
        }
        batchUtil.batchInsertMultiple(JSON.stringify(jsonArr), LICENSE_CENTRAL_TABLE, '');	
		
    },
    countUnknownDevicesPerDomain: function() {
		
		var ga = new GlideAggregate(HEALTH_CI_TABLE);
		ga.addNullQuery(CMDB_CI);
        ga.addNotNullQuery(NODE);
        ga.addAggregate("COUNT", NODE);
        ga.groupBy('sys_domain');
        ga.query();
        var unknownNodeCountPerDomain = {};
        while (ga.next()) {
            unknownNodeCountPerDomain[ga.getValue('sys_domain')] = ga.getAggregate("COUNT", NODE);
        }
        return unknownNodeCountPerDomain;
    },
	
	addSkuConditions: function(queryRecord, skuType) {
		var excludingTableName = skuType + HEALTH_EXCLUSIONS_SUFFIX;
		var excludeGr =  new GlideRecord (excludingTableName);
		excludeGr.addEncodedQuery("exclusion_reason.value_stream=health^ORexclusion_reason.value_stream=all");
		excludeGr.query();
		var cisToExclude = [];
		while(excludeGr.next()) {
			cisToExclude.push(excludeGr.getValue("ci"));
		}	
		
		// Removing OTOM Related exclusion from exclusion framework. Need to handle in the code for performance.
        if(skuType == ITOM_SKU_TYPE) 
			queryRecord.addNullQuery(CMDB_CI + '.cmdb_ot_entity');
		
        if(skuType == OTOM_SKU_TYPE) {
			queryRecord.addNotNullQuery(CMDB_CI + '.cmdb_ot_entity');
		}
		
		if(cisToExclude.length > 0)
			queryRecord.addQuery(CMDB_CI, "NOT IN", cisToExclude);
	},
    getCiCountByTypeAndDomain: function(skuType) {						
		
		var ga = new GlideAggregate(HEALTH_CI_TABLE);
		this.addSkuConditions(ga, skuType);
		
        ga.addNotNullQuery(CMDB_CI);
        // only query cis with duplicate_of null
        ga.addNullQuery(DUPLICATE_FIELD_DOT_WALK);
        // and check for install status
        ga.addQuery(INSTALL_STATUS_DOT_WALK, "NOT IN", EXCLUDE_CI_LIST);
        ga.addAggregate("COUNT", CMDB_CI);
        ga.groupBy(CLASS_NAME_DOT_WALK);
        ga.groupBy(DOMAIN_DOT_WALK);
        ga.query();
        var licenseCountRecords = [];
        while (ga.next()) {
            var ciTypeAndDomainCounts = {};
            var type = ga.getValue(CLASS_NAME_DOT_WALK);
            var count = ga.getAggregate("COUNT", CMDB_CI);
            var domain = ga.getValue(DOMAIN_DOT_WALK);
            ciTypeAndDomainCounts[type] = count;
            ciTypeAndDomainCounts['domain'] = domain;
            licenseCountRecords.push(ciTypeAndDomainCounts);
        }
        return licenseCountRecords;
    },
    checkForCi: function(ciSysId) {
        var gr = new GlideRecord(HEALTH_CI_TABLE);
        return gr.get(ciSysId);
    },
	
	removeExcludedCIs : function() {
		this.evtMgmtCommons.removeDoubleCountingOnVirtualAndPhysicalServer(HEALTH_CI_TABLE);
	},
    // Main function to be called in scheduled job
    process: function() {
        var pluginManager = new GlidePluginManager();
        var start = new Date().getTime();
        this.slowStepsManager.setTopic("ITOM Licensing: Health Processor");
        this.slowStepsManager.startStep('1: Delete previous CIs');
        // delete all previous records
        this.deletePreviousCIs();
        this.slowStepsManager.startStep('2: Populate EM CIs');
        this.populateEMCIs();
        this.slowStepsManager.startStep('3: Populate Occultus CIs');
        if (pluginManager.isActive('com.sn_occultus_glide'))
            this.populateOccultusCIs();
        this.slowStepsManager.startStep('4: Populate OI CIs');
        if (pluginManager.isActive('com.snc.sa.metric'))
            this.populateOICIs();
		
		this.slowStepsManager.startStep('5: Remove Excluded CIs');
		this.removeExcludedCIs();
        this.slowStepsManager.startStep('6: Populate to central table');
		var gr = new GlideRecord('itom_lu_sku_type');
        gr.query();
        while (gr.next()) {
            this.populateCentralTable(gr);
        }
        this.slowStepsManager.report();
        var end = new Date().getTime();
        this.evtMgmtCommons.writeToPerfTable("healthLicensingProcess", totalInserted, end - start, perfJson);
    },

    type: 'ITOMHealthLicenseCounterWithOTOM'
};
