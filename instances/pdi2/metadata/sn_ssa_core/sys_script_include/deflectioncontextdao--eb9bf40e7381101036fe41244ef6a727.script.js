var DeflectionContextDAO = Class.create();
DeflectionContextDAO.prototype = Object.extendsObject(global.ActivityContextDao, {
	initialize: function(activitySubContext) {
		global.ActivityContextDao.prototype.initialize.call(this, activitySubContext);
    },
	
    getActivities: function(reqObj) {
        var metaContextId = reqObj.contextId,
            module = reqObj.module,
            actualContextGr = reqObj.actualContextGr,
            startDate = reqObj.startDate,
            endDate = reqObj.endDate,
            fetchGroupsFromMapping = reqObj.fetchGroupsFromMapping,
            results = [],
            sortOrder = reqObj.sortOrder;

        //get activity types and mapping data from the cache
        var cacheData = this.cache.buildCache(metaContextId, module, '', fetchGroupsFromMapping);
        if (!cacheData || !cacheData.atypeContextMapping || !cacheData.activityTypeDetails || !Object.keys(cacheData.atypeContextMapping).length || !Object.keys(cacheData.activityTypeDetails))
            return {
                "activities": results,
            };

        var atypeContextMapping = cacheData.atypeContextMapping;
        var activityTypeDetails = cacheData.activityTypeDetails;

        var aTypesFromActivitiesTable = this.activityUtils.filterData(atypeContextMapping, "fetchFromActivities", ["true"]);
        var aTypesFromSourceTable = this.activityUtils.filterData(atypeContextMapping, "fetchFromActivities", ["false"]);

        var activityReqObj = {
            "aTypesFromActivitiesTable": aTypesFromActivitiesTable,
            "aTypesFromSourceTable": aTypesFromSourceTable,
            "activityTypeDetails": activityTypeDetails,
            "actualContextGr": actualContextGr,
            "startDate": startDate,
            "endDate": endDate,
            "sortOrder": sortOrder,
            "results": results
        };

        var fetchFromActivities = aTypesFromActivitiesTable && Object.keys(aTypesFromActivitiesTable).length;
        var fetchFromSource = aTypesFromSourceTable && Object.keys(aTypesFromSourceTable).length;

        if (fetchFromSource)
            this._buildAllDataFromSourceTables(activityReqObj);

        if (fetchFromActivities)
            this._buildAllDataFromActivitiesTable(activityReqObj);

        if (results.length > 0)
            results.sort(this.activityUtils.compare("created", sortOrder));

        return {
            "activities": results
        };
    },

    _buildAllDataFromSourceTables: function(activityReqObj, countToReturn) {
        var aTypesFromSourceTable = activityReqObj.aTypesFromSourceTable;
        var activityTypeDetails = activityReqObj.activityTypeDetails;
        for (var type in aTypesFromSourceTable) {
            var mapping = aTypesFromSourceTable[type];
            var tableName = mapping["sourceTable"];
            if (!tableName) continue;

            var sourceGr = new GlideRecord(tableName);
            if (activityTypeDetails[type])
                this._addEncodedQueryFromMap(mapping, activityTypeDetails[type], activityReqObj.actualContextGr, sourceGr);

            if (activityReqObj.startDate && activityReqObj.endDate) {
                sourceGr.addQuery("sys_created_on", ">=", activityReqObj.startDate);
                sourceGr.addQuery("sys_created_on", "<=", activityReqObj.endDate);
            }

            sourceGr.query();
            while (sourceGr.next()) {
                var result = {};
                result["sys_id"] = sourceGr.sys_id + "";
                result["source_table_name"] = sourceGr.getTableName() + "";
                result["created"] = sourceGr.getValue("sys_created_on") + "";
                result["activity_type_id"] = type + "";
                activityReqObj.results.push(result);
            }
        }
    },

    _buildAllDataFromActivitiesTable: function(activityReqObj) {
        var aTypesFromActivitiesTable = activityReqObj.aTypesFromActivitiesTable;
        var activityTypeDetails = activityReqObj.activityTypeDetails;

        var activityGr = new GlideRecord('sn_actsub_activity');
        for (var type in aTypesFromActivitiesTable) {
            var gr = new GlideRecord('sn_actsub_activity');
            if (activityTypeDetails[type]) {
                if (!activityTypeDetails[type]["mappingQuery"]) {
                    gr.addEncodedQuery("activity_type_id=" + type);
                    this._addEncodedQueryFromMap(aTypesFromActivitiesTable[type], activityTypeDetails[type], activityReqObj.actualContextGr, gr);
                }
            }
            activityGr.addEncodedQuery("^NQ" + gr.getEncodedQuery());
        }

        if (activityReqObj.startDate && activityReqObj.endDate) {
            activityGr.addQuery("sys_created_on", ">=", activityReqObj.startDate);
            activityGr.addQuery("sys_created_on", "<=", activityReqObj.endDate);
        }
        
        activityGr.query();
        while (activityGr.next()) {
            var result = {};
            result["sys_id"] = activityGr.sys_id + "";
            result["source_table_name"] = activityGr.getTableName() + "";
            result["created"] = activityGr.getValue("sys_created_on") + "";
            result["activity_type_id"] =
                activityGr.activity_type_id + "";
            activityReqObj.results.push(result);
        }

    },

    type: 'DeflectionContextDAO'
});
