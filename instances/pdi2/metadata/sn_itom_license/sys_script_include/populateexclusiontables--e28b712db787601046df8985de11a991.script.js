var PopulateExclusionTables = Class.create();
PopulateExclusionTables.prototype = {
    initialize: function() {
        jobStartTime = new GlideDateTime();
        valueStreams = ['visibility', 'health', 'optimization'];
        exclusionSuffix = '_exclusions';
        batchUtil = new global.BatchCommandUtilScript();
        batchSize = 5000;
    },

    _getExclusionTableList: function(valueStream, skuTypes) {

        var valueStreamList = [];
        var exclusionTables = [];
        if (valueStream == 'discovery')
            valueStream = 'visibility'; //exclusion table for visibility and discovery are same as both licenses can not be present in an instance
        if (valueStream == 'all')
            valueStreamList = valueStreams;
        else
            valueStreamList = [valueStream];

        //get all the sku types
        var skuTypeList = skuTypes.split(',');

        skuTypeList.forEach(function(skuTypeSysId) {
            var gr = new GlideRecord('itom_lu_sku_type');
            if (gr.get(skuTypeSysId) && gr.getValue('sku')) {

                var skuName = gr.getValue('sku');
                valueStreamList.forEach(function(valueStreamName) {
                    /*
                    exclusion table name format skuName +'_'+ valueStreamName+'_exclusions'
                    eg- itom_visibility_exclusions, itom_health_exclusions, itom_optimization_exclusions
                    otm_visibility_exclusions, otm_health_exclusions, otm_optimization_exclusions
                    */
                    var tableName = skuName + '_' + valueStreamName + exclusionSuffix;
                    exclusionTables.push(tableName);
                });
            }

        });
        return exclusionTables;
    },

    updateExclusionTables: function() {

        var exGr = new GlideRecord('itom_license_exclusion_metadata');
        exGr.addActiveQuery();
        exGr.query();
        while (exGr.next()) {
            var exclusionTables = this._getExclusionTableList(exGr.getValue('value_stream'), exGr.getValue('sku_type'));

            var excludedCIsList = [];
            var ci_identifier = exGr.getValue('ci_identifier');
            //if condition type is not script
            if (exGr.getValue('condition_type') != 'script') {
                var tableName = exGr.getValue('table_name');
                var encodedQuery = exGr.getValue('query');

                var tableGr = new GlideRecord(tableName);
                tableGr.addEncodedQuery(encodedQuery);
                tableGr.query();
                while (tableGr.next()) {
                    var ciDetail = {};
                    ciDetail.ciSysId = tableGr.getValue(ci_identifier);
                    if (exGr.getValue('condition_type') == 'relationship')
                        ciDetail.domain = tableGr[ci_identifier].sys_domain + ''; // domain of parent or child
                    else
                        ciDetail.domain = tableGr.getValue('sys_domain');

                    excludedCIsList.push(ciDetail);
                }

            } else {
                var evaluator = new GlideScopedEvaluator();
                excludedCIsList = evaluator.evaluateScript(exGr, 'script', null);
            }

            this._addCIsToExclusionTables(excludedCIsList, exclusionTables, exGr);
        }

        this._removeStaleRecords();
    },

    _addCIsToExclusionTables: function(excludedCIsList, exclusionTables, exclusionMetaDataGr) {
        if (!(excludedCIsList && excludedCIsList.length != 0))
            return;

        exclusionTables.forEach(function(table) {
            var existingCISysIDs = [];
            var jsonArr = [];
            var updateJsonArr = [];
            var counter = 0;
            excludedCIsList.forEach(function(excludedCI) {
                var ciSysId = excludedCI.ciSysId;
                if (!ciSysId)
                    return;

                var domain = excludedCI.domain || 'global';

                var exclusionTableGr = new GlideRecord(table);
                exclusionTableGr.addQuery('ci', ciSysId);
                exclusionTableGr.addQuery('exclusion_reason.category', exclusionMetaDataGr.getValue('category')).addOrCondition('exclusion_reason.category', 'All');
                exclusionTableGr.addQuery('exclusion_reason.active', true);
                exclusionTableGr.query();
                if (!exclusionTableGr.next()) {
                    jsonCountRecord = {};
                    jsonCountRecord.ci = ciSysId;
                    jsonCountRecord.exclusion_reason = exclusionMetaDataGr.getValue('sys_id');
                    jsonCountRecord.sys_domain = domain;
                    jsonArr.push(jsonCountRecord);
                    counter++;
                    if(counter == batchSize){
                    	batchUtil.batchInsertMultiple(JSON.stringify(jsonArr), table, '');
			counter = 0;
			jsonArr = [];
                    }

                } else {
                    existingCISysIDs.push(ciSysId);
                }			
            });

            batchUtil.batchInsertMultiple(JSON.stringify(jsonArr), table, '');

            while (existingCISysIDs.length > 0) {
		updateJsonArr = [];
                var firstBatch = existingCISysIDs.splice(0, batchSize);
                var tableGr = new GlideRecord(table);
                tableGr.addQuery('ci', 'IN', firstBatch);
                tableGr.addQuery('exclusion_reason.active', true);
                tableGr.query();
                while (tableGr.next()) {
                    jsonObj = {};
                    jsonObj.sys_id = tableGr.getValue('sys_id');
                    jsonObj.sys_updated_on = jobStartTime.toString();
                    updateJsonArr.push(jsonObj);
                }
                batchUtil.batchUpdateMultiple(JSON.stringify(updateJsonArr), table, '');
            }

        });
    },

    _removeStaleRecords: function() {
        var skuGr = new GlideRecord('itom_lu_sku_type');
        skuGr.query();
        while (skuGr.next()) {
            var skuName = skuGr.getValue('sku');
            if (!skuName)
                continue;
            valueStreams.forEach(function(valueStream) {
                /*
                    exclusion table name format skuName +'_'+ valueStream+'_exclusions'
                    eg- itom_visibility_exclusions, itom_health_exclusions, itom_optimization_exclusions
                    otm_visibility_exclusions, otm_health_exclusions, otm_optimization_exclusions
                    */
                var tableName = skuName + '_' + valueStream + exclusionSuffix;
                var tableGr = new GlideRecord(tableName);
                tableGr.addQuery('sys_updated_on', '<', jobStartTime);
                tableGr.query();
                tableGr.deleteMultiple();
            });
        }
    },

    type: 'PopulateExclusionTables'
};
