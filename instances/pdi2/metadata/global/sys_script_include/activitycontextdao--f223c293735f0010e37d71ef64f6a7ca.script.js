var ActivityContextDao = Class.create();
ActivityContextDao.prototype = {
    initialize: function(activitySubContext) {
        this.cache = new ActivityContextCache();
        this.activityUtils = new ActivityUtils();
    },

    /**
     * Returns the list of activity contexts for given module and table name.
     *
     * @param request
     * {
     *     activityModule: '066e03da73d30010e37d71ef64f6a7dc'
     *     tableName: 'customer_contact'
     * }
     * @return
     *  [
     *     {
     *       "sys_id": "e3bd726e73570010e37d71ef64f6a7bd",
     *       "name": "Contact"
     *     }
     *   ]
     */

    getActivityContexts: function(request) {
        if (!request.activityModule)
            throw "Invalid input: Activity Module.";

        var contextGR = new GlideRecord(ActivityConstants.TABLE_ACTIVITY_CONTEXT);
		contextGR.addActiveQuery();
        contextGR.addQuery('module', request.activityModule);
		contextGR.addQuery('module.active', true);
        if (request.tableName)
            contextGR.addQuery('context_table', request.tableName);
        contextGR.query();
        var context, contexts = [];
        while (contextGR.next()) {
            context = {};
            context.sys_id = contextGR.sys_id + "";
            context.name = contextGR.name.toString();
            contexts.push(context);
        }
        return contexts;
    },

    /*
     * This method returns the activities for a given context, subscribable object(s)
     * @ Parameter - metaContextId: sys_id of a record in Activity Context table
     * @ Parameter - actualContextGr: GlideRecord of the table mentioned in context_table field of Activity Context table, ex: GlideRecord of a contact
     * @ Parameter - facetIds: comma separated list of facet sys_ids   
     * @ Parameter - recordId: sys_id of a record, applicable in case of dynamic facets
     * Response format: 
     *	 [
     *	 {
     *	 "icon":"", 
     *   "activity_type_id":"",
     *   "source_table_name":"",
     *	 "title":"",
     *	 "created":"", 
     *	 "subobject_table_name":"",
     *	 "subobject_sys_id":"",
     *	 "subheader_fields":[{"label":"field1","value":"","deeplink_to_subobject":"","display_as_timeago":"","show_label":""},
	 *   {"label":"field2","value":"","deeplink_to_subobject":"","display_as_timeago":"","show_label":""}], 
     *	 "content_fields": [{"label":"field3","value":"","deeplink_to_subobject":"","display_as_timeago":"","show_label":""},
	 *   {"label":"field4","value":"","deeplink_to_subobject":"","display_as_timeago":"","show_label":""}]
     *	 }
     *	 {"icon":"", ...}
     *   ]
     */
    getActivities: function(reqObj) {
        var metaContextId = reqObj.contextId,
            module = reqObj.module,
            actualContextGr = reqObj.actualContextGr,
            facetIds = reqObj.facetIds,
            recordId = reqObj.recordId,
            activityLimit = parseInt(reqObj.activity_count),
            pageStart = reqObj.pageStart,
            pageEnd = reqObj.pageEnd,
            startDate = reqObj.startDate,
            endDate = reqObj.endDate,
            fetchGroupsFromMapping = reqObj.fetchGroupsFromMapping,
            results = [],
            resultsLocationMap = [],
            facetInfo = reqObj.facetInfo,
            resultsForFacet = {
                "activitiesCount": 0,
                "results": []
            },
            searchText = reqObj.searchText;

        if (facetIds) facetIds = facetIds.toString().split(",");

        //get activity types and mapping data from the cache
        var cacheData = this.cache.buildCache(metaContextId, module, facetIds, fetchGroupsFromMapping);
        if (!cacheData || !cacheData.atypeContextMapping || !cacheData.activityTypeDetails || !Object.keys(cacheData.atypeContextMapping).length || !Object.keys(cacheData.activityTypeDetails))
            return this._getResponseObject(results, false, pageStart, pageEnd);
			
        var atypeContextMapping = cacheData.atypeContextMapping;
        var activityTypeDetails = cacheData.activityTypeDetails;

        var aTypesFromActivitiesTable = this.activityUtils.filterData(atypeContextMapping, "fetchFromActivities", ["true"]);
        var aTypesFromSourceTable = this.activityUtils.filterData(atypeContextMapping, "fetchFromActivities", ["false"]);

        var activityReqObj = {
            "aTypesFromActivitiesTable": aTypesFromActivitiesTable,
            "aTypesFromSourceTable": aTypesFromSourceTable,
            "activityTypeDetails": activityTypeDetails,
            "actualContextGr": actualContextGr,
            "recordId": recordId,
            "activityLimit": activityLimit,
            "pageStart": pageStart || 0,
            "pageEnd": pageEnd || activityLimit,
            "startDate": startDate,
            "endDate": endDate,
            "before": reqObj.before,
            "activityDate": reqObj.activityCreatedDate,
            "results": results,
            "resultsLocationMap": resultsLocationMap,
            "facetInfo": facetInfo,
            "resultsForFacet": resultsForFacet,
            "windowInfo": {}
        };
        var fetchFromActivities = aTypesFromActivitiesTable && Object.keys(aTypesFromActivitiesTable).length;
        var fetchFromSource = aTypesFromSourceTable && Object.keys(aTypesFromSourceTable).length;

        if (facetInfo) {
            if (fetchFromSource) {
               this._buildDataFromSourceTablesForFacets(activityReqObj);
           }
           if (fetchFromActivities)
               this._buildActivityInfoForFacetsFromActivitiesTable(activityReqObj);
           this._buildResultForFacetsInfo(activityReqObj.facetInfo.subObjSysIds, activityReqObj.facetInfo.subObjectTable, activityReqObj);
            if (facetInfo.isStaticFacet)
                return resultsForFacet.activitiesCount;
            results = resultsForFacet.results;

        } else {
            if (activityReqObj.pageStart >= 0 && activityReqObj.pageEnd >= 0) {
                var countToReturn = activityReqObj.pageEnd - activityReqObj.pageStart;
                //Query activities table and populate results
                if (fetchFromActivities) {
                    this._buildDataFromActivitiesTable(activityReqObj, countToReturn, searchText);
                }
                //Query all the source tables and populate results
                if (fetchFromSource) {
                    this._buildDataFromSourceTables(activityReqObj, countToReturn, searchText);
                }
            }
        }

        //Sort the activities based on created date
        if (results.length)
            results.sort(this.activityUtils.compare("created"));

        if (facetInfo)
            return results;

        return this._getNresults(results, resultsLocationMap, activityReqObj.pageStart, activityReqObj.pageEnd, activityReqObj.actualContextGr.sys_id + "");
    },

    _getNresults: function(results, resultsLocationMap, pageStart, pageEnd, contextInstanceId) {
        if (!results || !results.length) return this._getResponseObject([], false, pageStart, pageEnd);
           
        var n = pageEnd - pageStart;
        var activities = [],
            locationInfo = this._getFromCache(ActivityConstants.ACTIVITY_PAGINATION_LOCATION_KEY),
            counter = 0;
        if (!locationInfo) locationInfo = {};
        var locationData = locationInfo[contextInstanceId];
        for (var i = 0, len = results.length; i < len; i++) {
            var resultId = results[i]["sys_id"] + "",
                sourceTable;
            if (counter < n) {
                activities.push(results[i]);
                if (resultsLocationMap[resultId]) { //Get the last record information of each source table
                    sourceTable = resultsLocationMap[resultId]["source_table"];
                    if (sourceTable) {
                        if (!locationData) locationData = {};
                        if (!locationData[sourceTable]) locationData[sourceTable] = {};
                        locationData[sourceTable]["query"] = resultsLocationMap[resultId]["query"];
                        locationData[sourceTable]["query_location"] = resultsLocationMap[resultId]["query_location"];
                    }
                }
                counter++;
            } else {
                if (resultsLocationMap[resultId]) {
                    sourceTable = resultsLocationMap[resultId]["source_table"];
                    if (sourceTable) {
                        if (!locationData) locationData = {};
                        if (!locationData[sourceTable]) {
                            locationData[sourceTable] = {};
                            locationData[sourceTable]["query"] = resultsLocationMap[resultId]["query"];
                            locationData[sourceTable]["query_location"] = -1;
                        }
                    }
                }
            }
        }
        //Store the last record information of each source table in session cache
        if (locationData && Object.keys(locationData).length) {
            locationInfo[contextInstanceId] = locationData;
            this._setCache(ActivityConstants.ACTIVITY_PAGINATION_LOCATION_KEY, locationInfo);
        }
		var hasMoreRecords = results.length > n ? true : false;
		return this._getResponseObject(activities, hasMoreRecords, pageStart, pageEnd);
    },
	
	_getResponseObject: function(activities, hasMoreRecords, pageStart, pageEnd) {
        return {
            "activities": activities,
			"hasMoreRecords": hasMoreRecords,
			"window_from": pageStart,
			"window_to": pageEnd
        };
    },

    _buildDataFromActivitiesTable: function(activityReqObj, countToReturn, searchText) {
        var aTypes = activityReqObj.aTypesFromActivitiesTable ? Object.keys(activityReqObj.aTypesFromActivitiesTable) : "";
        if (!aTypes || !aTypes.length) return;
        var aTypesFromActivitiesTable = activityReqObj.aTypesFromActivitiesTable;
        var activityTypeDetails = activityReqObj.activityTypeDetails;

        activityReqObj["windowInfo"][ActivityConstants.TABLE_ACTIVITY] = {
            "localResults": [],
            "recordsAvailable": true
        };
        var windowObj = activityReqObj["windowInfo"][ActivityConstants.TABLE_ACTIVITY];
        while (windowObj.localResults.length <= countToReturn && windowObj.recordsAvailable) {
            var activityObj = this._buildActivitiesGlideRecord(activityReqObj, aTypesFromActivitiesTable, activityTypeDetails, aTypes);
            var activities = activityObj.activities;
            var encodedQuery = activityObj.encodedQuery;
            while (windowObj.localResults.length <= countToReturn && activities.next()) {
                var sourceGr = this.activityUtils.getGlideRecord(activities.object_name, {
                    "sys_id": activities.getElement('object_id')
                });
				var activityCreatedDate = activities.getElement('sys_created_on');
                if (sourceGr && sourceGr.canRead()) {
                    var feedConditionMet = this._isFeedConditionMet(sourceGr, activityTypeDetails, activities.activity_type_id + "");
                    if (feedConditionMet)
                        this._buildActivityInfo(activities.activity_type_id + "", activityTypeDetails, sourceGr, activityReqObj, ActivityConstants.TABLE_ACTIVITY, encodedQuery, activities.getLocation(), searchText, activityCreatedDate);
                }
            }
            windowObj.localNextPageRequest = true;
        }
    },

    //builds activity glide record.
    _buildActivitiesGlideRecord: function(activityReqObj, aTypesFromActivitiesTable, activityTypeDetails, aTypes) {
        var activities = new GlideRecord(ActivityConstants.TABLE_ACTIVITY);
        for (var i = 0, len = aTypes.length; i < len; i++) {
            var type = aTypes[i];
            var gr = new GlideRecord(ActivityConstants.TABLE_ACTIVITY);
            if (activityTypeDetails[type]) {
                if (!activityTypeDetails[type]["mappingQuery"]) {
                    gr.addEncodedQuery("activity_type_id=" + type);
                    this._addEncodedQueryFromMap(aTypesFromActivitiesTable[type], activityTypeDetails[type], activityReqObj.actualContextGr, gr);
                } else gr.addEncodedQuery(activityTypeDetails[type]["mappingQuery"]);
            }
            activities.addEncodedQuery("^NQ" + gr.getEncodedQuery());
        }
        if (activityReqObj.recordId) activities.addQuery("object_id", activityReqObj.recordId);
        if (activityReqObj.before) activities.addQuery('sys_created_on', '<=', activityReqObj.before);
        activities.orderByDesc("sys_created_on");
        var encodedQuery = this._setDataScopeParamsonGR(activities, ActivityConstants.TABLE_ACTIVITY, activityReqObj);
        return {
            "activities": activities,
            "encodedQuery": encodedQuery
        };
    },

    _buildDataFromSourceTables: function(activityReqObj, countToReturn, searchText) {
        var aTypesFromSourceTable = activityReqObj.aTypesFromSourceTable;
        var activityTypeDetails = activityReqObj.activityTypeDetails;

        for (var type in aTypesFromSourceTable) {
            var mapping = aTypesFromSourceTable[type];
            var tableName = mapping["sourceTable"];
            if (!tableName) continue;

            activityReqObj["windowInfo"][tableName] = {
                "localResults": [],
                "recordsAvailable": true
            };
            var windowObj = activityReqObj["windowInfo"][tableName];
            while (windowObj.localResults.length <= countToReturn && windowObj.recordsAvailable) {
                var sourceGr = new GlideRecord(tableName);
                if (activityTypeDetails[type]) {
                    if (!activityTypeDetails[type]["mappingQuery"]) {
                        this._addEncodedQueryFromMap(mapping, activityTypeDetails[type], activityReqObj.actualContextGr, sourceGr, activityReqObj.recordId);
                    } else sourceGr.addEncodedQuery(activityTypeDetails[type]["mappingQuery"]);
                    var feedConditions = activityTypeDetails[type]["conditions"];
                    if (feedConditions)
                        sourceGr.addEncodedQuery(feedConditions);
                }
                if (activityReqObj.before) sourceGr.addQuery('sys_created_on', '<=', activityReqObj.before);
                sourceGr.orderByDesc("sys_created_on");
                var encodedQuery = this._setDataScopeParamsonGR(sourceGr, tableName, activityReqObj);
                while (windowObj.localResults.length <= countToReturn && sourceGr.next()) {
                    if (sourceGr.canRead()) {
                        this._buildActivityInfo(type, activityTypeDetails, sourceGr, activityReqObj, tableName, encodedQuery, sourceGr.getLocation(), searchText, '');
                    }
                }
                windowObj.localNextPageRequest = true;
            }
        }
    },

    _isFeedConditionMet: function(sourceGr, activityTypeDetails, typeId) {
        var conditionMet = true;
        if (activityTypeDetails[typeId] && activityTypeDetails[typeId]["conditions"]) {
            conditionMet = GlideFilter.checkRecord(sourceGr, activityTypeDetails[typeId]["conditions"]);
        }
        return conditionMet;
    },

    _buildActivityInfo: function(aType, activityTypeDetails, sourceGr, activityReqObj, tableName, encodedQuery, location, searchText, activityCreatedDate) {
        if (activityTypeDetails[aType] && activityTypeDetails[aType]["subobject"]) {
            var subObjTable = activityTypeDetails[aType]["subobject"]["name"];
            var subObjFieldinSource = activityTypeDetails[aType]["subobject"]["subobjField"];
            if (subObjFieldinSource) {
                var subObjGr = null;
                var result;
                if (subObjFieldinSource == "sys_id") { //If subobjField in source table is sys_id, it means Activity Source is same as Subscribable Object
                    subObjGr = sourceGr;
                    result = this._getActivityInfo(sourceGr, subObjGr, aType, activityTypeDetails, searchText, activityCreatedDate, activityReqObj);
                } else {
                    var subObjSysId = sourceGr.getElement(subObjFieldinSource);
                    if (subObjTable && subObjSysId) {
                        subObjGr = new GlideRecord(subObjTable);
                        if (subObjGr.get(subObjSysId) && subObjGr.canRead())
                            result = this._getActivityInfo(sourceGr, subObjGr, aType, activityTypeDetails, searchText, activityCreatedDate, activityReqObj);
                    }
                }
                if (result && Object.keys(result).length) {
                    activityReqObj.results.push(result);
                    if (activityReqObj["windowInfo"][tableName]) activityReqObj["windowInfo"][tableName]["localResults"].push(result);
                    var locationObj = {
                        "source_table": tableName,
                        "query": encodedQuery,
                        "query_location": location
                    };
                    activityReqObj.resultsLocationMap[result.sys_id + ""] = locationObj;
                }
            }
        }
    },

    _setDataScopeParamsonGR: function(gr, table, activityReqObj) {
		var optimizer = new ActivityQueryOptimizer();
        var curQuery = gr.getEncodedQuery() + "";
        if (activityReqObj.startDate && activityReqObj.endDate) {
            gr.addQuery("sys_created_on", ">=", activityReqObj.startDate);
            gr.addQuery("sys_created_on", "<=", activityReqObj.endDate);
            curQuery = gr.getEncodedQuery() + "";
        } 

        if (activityReqObj.facetInfo) {
            curQuery = gr.getEncodedQuery() + "";
			curQuery = optimizer.optimizeMe(curQuery);
            return curQuery;
        }

        var countToReturn = activityReqObj.pageEnd - activityReqObj.pageStart;
        var pageStart = activityReqObj.pageStart;
        var pageEnd = activityReqObj.pageEnd;
        //If it is request for next page, since required number of records are not present in the first page, start from the previously stopped window end
        var localNextPageRequest = activityReqObj["windowInfo"][table] && activityReqObj["windowInfo"][table]["localNextPageRequest"];
        if (localNextPageRequest) {
            pageStart = activityReqObj["windowInfo"][table]["pageEnd"];
            pageEnd = activityReqObj["windowInfo"][table]["pageEnd"] + countToReturn;
        }
        if (pageStart >= 0 && pageEnd >= 0) {
            var start = pageStart,
                end = pageEnd;
            var key = activityReqObj.actualContextGr.sys_id + "";
            var locationInfo = this._getFromCache(ActivityConstants.ACTIVITY_PAGINATION_LOCATION_KEY);
            var locationData = locationInfo ? locationInfo[key] : null;
            if (pageStart > 0 && !localNextPageRequest) { //get the last location information of the table from the session cache
                if (locationData && locationData[table] && locationData[table]["query"] == curQuery && locationData[table]["query_location"] >= -1) {
                    start = locationData[table]["query_location"] + 1;
                    end = start + countToReturn;
                }
            } else if (pageStart == 0) { //On request for the first page, clear the query_location information of the table from cache if exists
                if (locationData && locationData[table]) {
                    delete locationData[table];
                    locationInfo[key] = locationData;
                    this._setCache(ActivityConstants.ACTIVITY_PAGINATION_LOCATION_KEY, locationInfo);
                }
            }
            end = end + (end - start); //Doubling the window size to reduce extra queries

			gr = optimizer.getOptimizedGlideRecord(gr);
			//apply choosewindow on optimized gr/query.
			gr.chooseWindow(start, end);
            gr.query();
            var rowCount = gr.getRowCount();

            if (activityReqObj["windowInfo"][table]) {
                activityReqObj["windowInfo"][table]["pageStart"] = start;
                activityReqObj["windowInfo"][table]["pageEnd"] = end;
            }

            if (rowCount == 0 || start >= rowCount || end >= rowCount) {
                if (activityReqObj["windowInfo"][table])
                    activityReqObj["windowInfo"][table]["recordsAvailable"] = false;
            }

        }
        return curQuery;
    },

    /*
     * This method returns the data that is displayed in the activity feed item
     * @ Parameter - sourceGr: GlideRecord for Activity Source table
     * @ Parameter - subObjGr: GlideRecord for Subscribable Object table
     * @ Parameter - activityTypeId: sys_id of the Activity Type record
     * @ Parameter - activityTypeDetails: JSON object containing details of the activity type, subscribable object, template, template fields
     * Response format: 
     *	 {
     *	 "sys_id":""
     *	 "icon":"", 
     *   "activity_type_id":"",
     *   "source_table_name":"",
     *	 "title":"",
     *	 "created":"", 
     *	 "subobject_table_name":"",
	 *   "subobject_table_label": "",
     *	 "subobject_sys_id":"",
     *	 "subheader_fields":[{"label":"field1","value":"","deeplink_to_subobject":"","display_as_timeago":"","show_label":""},
	 *   {"label":"field2","value":"","deeplink_to_subobject":"","display_as_timeago":"","show_label":""}],
     *	 "content_fields": [{"label":"field3","value":"","deeplink_to_subobject":"","display_as_timeago":"","show_label":""},
	 *   {"label":"field4","value":"","deeplink_to_subobject":"","display_as_timeago":"","show_label":""}]
     *   }
     */
    _getActivityInfo: function(sourceGr, subObjGr, activityTypeId, activityTypeDetails, searchText, activityCreatedDate, activityReqObj) {
        if (!sourceGr || !subObjGr || !activityTypeId || !activityTypeDetails[activityTypeId]) return {};

        var result = {};
        var activityTypeObj = activityTypeDetails[activityTypeId];
        var actor = sourceGr.getDisplayValue(activityTypeObj["actorField"]);
        var object = sourceGr.getDisplayValue(activityTypeObj["objectField"]);
        var target = sourceGr.getDisplayValue(activityTypeObj["targetField"]);
        var isActivityDateTrue = activityReqObj.activityDate && (activityReqObj.activityDate[0] === "true" || activityReqObj.activityDate[0] === true);
        result["sys_id"] = sourceGr.sys_id + "";
        result["icon"] = "";
		result["icon_background"] = "";
        result["activity_type_id"] = activityTypeId + "";
        result["source_table_name"] = sourceGr.getTableName() + "";
        result["title"] = activityTypeObj["message"] ? this.activityUtils.getActivityTypeMessage(activityTypeObj["message"], actor, object, target) : "";
        result["created"] = isActivityDateTrue ? String(activityCreatedDate || sourceGr.getValue("sys_created_on")) : String(sourceGr.getValue("sys_created_on"));
        result["subobject_table_name"] = subObjGr.getTableName() + "";
		result["subobject_table_label"] = subObjGr.getClassDisplayValue() + "";
        result["subobject_sys_id"] = subObjGr.sys_id + "";
        result["subheader_fields"] = [];
        result["content_fields"] = [];

        var template = activityTypeObj["template"];
        if (!template) return result;
        result["icon"] = template["icon"];
		result["icon_background"] = template["icon_background"];

        var templateFields = template["fields"];
        if (!templateFields) return result;
        for (var i = 0; i < templateFields.length; i++) {
            var fieldObj = {};
            var templateField = templateFields[i];

            if (templateField["type"] == ActivityConstants.TYPE_ACTIVITY_SOURCE_TABLE) {
				if (templateField["condition"] && !GlideFilter.checkRecord(sourceGr, templateField["condition"]))
					continue;
                fieldObj["label"] = sourceGr.getElement(templateField["label"]).getLabel() + "";
                fieldObj["type"] = sourceGr.getElement(templateField["label"]).getED().getInternalType() + "";
                if (fieldObj["type"] == "glide_date_time" || fieldObj["type"] == "glide_date") {
                    fieldObj["value"] = sourceGr.getElement(templateField["label"]) + "";
                } else {
                    fieldObj["value"] = sourceGr.getElement(templateField["label"]).getDisplayValue() + "";
                }
            } else if (templateField["type"] == ActivityConstants.TYPE_ACTIVITY_GROUP_TABLE) {
				if (templateField["condition"] && !GlideFilter.checkRecord(subObjGr, templateField["condition"]))
					continue;
                fieldObj["label"] = subObjGr.getElement(templateField["label"]).getLabel() + "";
                fieldObj["value"] = subObjGr.getElement(templateField["label"]).getDisplayValue() + "";
                fieldObj["type"] = subObjGr.getElement(templateField["label"]).getED().getInternalType() + "";
                if (fieldObj["type"] == "glide_date_time" || fieldObj["type"] == "glide_date") {
                    fieldObj["value"] = subObjGr.getElement(templateField["label"]) + "";
                } else {
                    fieldObj["value"] = subObjGr.getElement(templateField["label"]).getDisplayValue() + "";
                }
            }

            fieldObj["deeplink_to_subobject"] = templateField["deeplink"] + "";
            fieldObj["display_as_timeago"] = templateField["timeago"] + "";
            fieldObj["show_label"] = templateField["showLabel"] + "";

            if (templateField["position"] == ActivityConstants.POSITION_SUB_HEADER)
                result["subheader_fields"].push(fieldObj);
            else if (templateField["position"] == ActivityConstants.POSITION_CONTENT) {
				fieldObj["content_icon"] = templateField["contentIcon"] + "";
				fieldObj["content_tooltip"] = templateField["contentTooltip"] + "";
                result["content_fields"].push(fieldObj);
			}
        }
        var matchFound = this._verifyKeywordExists(searchText, result);
        return matchFound ? result : {};
    },

    /*
     * This method returns encoded query from the Activity Type Context Mapping
     * @ Parameter - mapping: Object containing mapping information of an activity type
     * @ Parameter - activityTypeDetails: Object containing activity type information of an activity type
     * @ Parameter - actualSubobjId: sys_id of the actual subscribable object, ex: sys_id of a knowledge record
     * @ Parameter - actualContextGr: GlideRecord of the table mentioned in context_table field of Activity Context table, ex: GlideRecord of a contact
     * @ Parameter - sourceGr: GlideRecord of the activities table or the source table
     * Returns encodedquery
     */
    _addEncodedQueryFromMap: function(mapping, activityTypeDetails, actualContextGr, sourceGr, recordId) {
        if (!mapping || !activityTypeDetails || !actualContextGr) return;
        var query = "";
        if (recordId && activityTypeDetails["subobject"] && activityTypeDetails["subobject"]["subobjField"]) {
            var subObjField = activityTypeDetails["subobject"]["subobjField"];
            sourceGr.addQuery(subObjField, recordId);
        }
        if (mapping["mappingCriteria"]) query = mapping["mappingCriteria"];

        if (mapping["advanced"] == "false" && mapping["sourceMappingField"] && mapping["contextMappingField"]) {
            if (query) query += "^" + mapping["sourceMappingField"] + "=" + actualContextGr.getValue(mapping["contextMappingField"]);
            else query = mapping["sourceMappingField"] + "=" + actualContextGr.getValue(mapping["contextMappingField"]);
        }
        sourceGr.addEncodedQuery(query);
        if (mapping["advanced"] == "true") {
            var mappingGr = new GlideRecord(ActivityConstants.TABLE_SOURCE_CONTEXT_MAPPING);
            if (mappingGr.get(mapping["mapId"]) && mapping["advancedScriptField"]) {
                var evaluator = new GlideScopedEvaluator();
                evaluator.putVariable("current", sourceGr);
                evaluator.putVariable("context", actualContextGr);
                var scriptResult = evaluator.evaluateScript(mappingGr, mapping["advancedScriptField"]);
            }
        }
        activityTypeDetails["mappingQuery"] = sourceGr.getEncodedQuery();
    },

    //builds child facet info from multiple source tables
    _buildDataFromSourceTablesForFacets: function(activityReqObj) {
        var aTypesFromSourceTable = activityReqObj.aTypesFromSourceTable;
        var activityTypeDetails = activityReqObj.activityTypeDetails;
		var subObjSysIds = {};
        for (var type in aTypesFromSourceTable) {
            var mapping = aTypesFromSourceTable[type];
            var tableName = mapping["sourceTable"];
            if (!tableName) continue;
            if (activityReqObj.facetInfo)
                this._buildActivityInfoForFacets(mapping, type, activityTypeDetails, tableName, activityReqObj, subObjSysIds);
        }
		activityReqObj.facetInfo["subObjSysIds"] = subObjSysIds;
    },

    //builds child facet info from multiple source tables
    _buildActivityInfoForFacets: function(mapping, type, activityTypeDetails, tableName, activityReqObj, subObjSysIds) {
        var subObjTable, subObjFieldinSource;
        if (activityTypeDetails[type] && activityTypeDetails[type]["subobject"]) {
            subObjTable = activityTypeDetails[type]["subobject"]["name"];
            subObjFieldinSource = activityTypeDetails[type]["subobject"]["subobjField"];
        } else return;
        var sourceGr, isSameSourceTable = true;
        //build source gr based on facet type and source table and subObjeTable
        if (tableName != subObjTable && !activityReqObj.facetInfo.isStaticFacet) {
            sourceGr = new GlideAggregate(tableName);
            sourceGr.addAggregate('MAX', 'sys_created_on');
            sourceGr.groupBy(subObjFieldinSource);
            isSameSourceTable = false;
        } else
            sourceGr = new GlideRecord(tableName);
        this._addEncodedQueryFromMap(mapping, activityTypeDetails[type], activityReqObj.actualContextGr, sourceGr, activityReqObj.recordId);
		var feedConditions = activityTypeDetails[type]["conditions"];
		if (feedConditions)
			sourceGr.addEncodedQuery(feedConditions);
        this._setDataScopeParamsonGR(sourceGr, tableName, activityReqObj);
		sourceGr.query();
        //If static facet, store count of activities and return
        if (activityReqObj.facetInfo.isStaticFacet) {
            activityReqObj.resultsForFacet.activitiesCount += sourceGr.getRowCount();
            return;
        }
        //get activities content info to display under dynamic facet.
        while (sourceGr.next()) {
			var created, subObjSysId = subObjFieldinSource ? sourceGr.getElement(subObjFieldinSource) + "" : "";
			created = (!isSameSourceTable) ? sourceGr.getAggregate('MAX', 'sys_created_on') + " " : sourceGr.getValue("sys_created_on") + " ";
			if (!subObjSysIds[subObjSysId] || subObjSysIds[subObjSysId] < created)
				subObjSysIds[subObjSysId] = created;
        }
    },

    //builds child facet info from activities table
    _buildActivityInfoForFacetsFromActivitiesTable: function(activityReqObj) {
        var aTypes = activityReqObj.aTypesFromActivitiesTable ? Object.keys(activityReqObj.aTypesFromActivitiesTable) : "";
        if (!aTypes || !aTypes.length) return;
        var activityObj = this._buildActivitiesGlideRecord(activityReqObj, activityReqObj.aTypesFromActivitiesTable, activityReqObj.activityTypeDetails, aTypes);
        var activities = activityObj.activities;
        activities.query();
        if (activityReqObj.facetInfo.isStaticFacet) {
			activityReqObj.resultsForFacet.activitiesCount += this._getActivityCountForStaticFacets(activityReqObj, activities);
            return;
        }
        var objsWithSameSourceTab, actualSysId, sysCreatedOn, subObjTable, objectTable, subObjFieldinSource, sourceGr, aType, keys, subObjSysIds;
        //get activities content info to display under dynamic facet.
        if (activities.hasNext()) {
			subObjSysIds = activityReqObj.facetInfo.subObjSysIds;
			if(!subObjSysIds)
				subObjSysIds={};
            objsWithSameSourceTab = {};
            while (activities.next()) {
                aType = activities.activity_type_id + '';
				if (!activityReqObj.activityTypeDetails || !activityReqObj.activityTypeDetails[aType])
					continue;
                if (!subObjTable)
                    subObjTable = activityReqObj.activityTypeDetails[aType]["subobject"]["name"];
                subObjFieldinSource = activityReqObj.activityTypeDetails[aType]["subobject"]["subobjField"];
                if (!subObjTable || !subObjFieldinSource) return;
                objectTable = activities.object_name + '';
                sourceGr = this.activityUtils.getGlideRecord(objectTable, {
					"sys_id": activities.getElement('object_id')
				}, activityReqObj.activityTypeDetails[aType]["conditions"]);
                if (sourceGr) {
                    actualSysId = sourceGr.getValue(subObjFieldinSource) + '';
                    sysCreatedOn = sourceGr.sys_created_on + '';
					if (objsWithSameSourceTab[actualSysId] || subObjSysIds[actualSysId]) {
						if (subObjSysIds[actualSysId] < sysCreatedOn)
							subObjSysIds[actualSysId] = sysCreatedOn;
						continue;
					}
                    if (subObjTable == objectTable && sourceGr.canRead()) {
                        objsWithSameSourceTab[actualSysId] = sysCreatedOn;
                        activityReqObj.resultsForFacet.results.push(this._getFacetChildInfo(sourceGr, activityReqObj.facetInfo.titleField, activityReqObj.facetInfo.fieldList, '', '', objsWithSameSourceTab));
                    } else
                        subObjSysIds[actualSysId] = sysCreatedOn;
                }
            }
			activityReqObj.facetInfo["subObjSysIds"] = subObjSysIds;
        }
    },
	
	_getActivityCountForStaticFacets: function(activityReqObj, activitiesGr) {
		var count = 0;
		while (activitiesGr.next()) {
			aType = activitiesGr.activity_type_id + '';
			var sourceGr = this.activityUtils.getGlideRecord(activitiesGr.object_name + '', {
					"sys_id": activitiesGr.getElement('object_id')
				}, activityReqObj.activityTypeDetails[aType]["conditions"]);
			if (sourceGr && sourceGr.canRead()) count++;
		}
		return count;
	},
	
	_buildResultForFacetsInfo: function(actualObjects, subObjTable, activityReqObj) {
		if (!subObjTable || !actualObjects) return;
		var subObjGr, keys = Object.keys(actualObjects);
		if (keys.length) {
			subObjGr = new GlideRecord(subObjTable);
			subObjGr.addQuery('sys_id', 'IN', keys);
			subObjGr.query();
			while (subObjGr.next())
				if (subObjGr.canRead())
					activityReqObj.resultsForFacet.results.push(this._getFacetChildInfo(subObjGr, activityReqObj.facetInfo.titleField, activityReqObj.facetInfo.fieldList, '', false, actualObjects));
		}
	},

    _getFacetChildInfo: function(sourceGR, title, fieldList, activityGR, isSameSourceTable, actualObjects) {
        var childInfo = {
            'created': (actualObjects) ? actualObjects[sourceGR.sys_id + ''] : (isSameSourceTable) ? activityGR.getValue("sys_created_on") + " " : activityGR.getAggregate('MAX', 'sys_created_on') + " ",
            'title': sourceGR.getElement(title).getDisplayValue() + '',
            'sys_id': sourceGR.sys_id + '',
            'metadata': []
        };
        var fieldLen = fieldList.length;
        for (var i = 0; i < fieldLen; i++)
            childInfo['metadata'].push(this._getFieldInfo(sourceGR, fieldList[i]));
        return childInfo;
    },

    //fetches field related information
    _getFieldInfo: function(sourceGR, field) {
        var fieldInfo = sourceGR.getElement(field);
        return {
            "value": fieldInfo.getDisplayValue() + '',
			"raw_value": fieldInfo.getValue() + '',
            "label": fieldInfo.getLabel() + '',
            "type": fieldInfo.getED().getInternalType() + '',
            "key": fieldInfo.getName() + ''
        };
    },

    //Methods to get/set information from session cache
    _getFromCache: function(key) {
        return JSON.parse(gs.getSession().getClientData(key));
    },

    _setCache: function(key, object) {
        gs.getSession().putClientData(key, JSON.stringify(object));
    },
    //Method which returns a boolean based on searchText
    _verifyKeywordExists: function(searchText, item) {
        // Return true if searchText is undefined or empty
        if (!searchText || searchText[0].trim() === "") return true;

        // Convert searchText into a list of lowercase search words
        var searchWords = searchText[0].toLowerCase().split(/\s+/);

        // Create a single regular expression pattern to match any of the search words
        var searchPattern = searchWords.map(function(word) {
            // Escape special regex characters in each word
            return word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        }).join('|'); // Join words with '|' to create an 'or' regex pattern

        var regex = new RegExp(searchPattern, 'i');

        // Helper function to check if text matches the regex pattern
        function matchesSearchPattern(text) {
            return regex.test(text);
        }

        // Check 'title' for any search word
        if (matchesSearchPattern(item.title)) return true;

        // Check 'subheader_fields' for any search word in 'value' fields
        for (var i = 0; i < item.subheader_fields.length; i++) {
            if (matchesSearchPattern(item.subheader_fields[i].value)) {
                return true;
            }
        }

        // Check 'content_fields' for any search word in 'value' fields
        for (var j = 0; j < item.content_fields.length; j++) {
            if (matchesSearchPattern(item.content_fields[j].value)) {
                return true;
            }
        }
        return false;
    },

    type: 'ActivityContextDao'
};
