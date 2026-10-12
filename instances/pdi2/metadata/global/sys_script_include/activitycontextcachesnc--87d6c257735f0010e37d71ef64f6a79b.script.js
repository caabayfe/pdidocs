var ActivityContextCacheSNC = Class.create();
ActivityContextCacheSNC.prototype = {
    initialize: function() {
        this.activityUtils = new ActivityUtils();
		this.actsubCache = new sn_actsub.ActSubCache();
    },

    //Build cache for Activity Groups, Activity Types, ActivityType-Context of the given context and faceIds, if data does not exist in the cache
    buildCache: function(contextId, module, facetIds, fetchGroupsFromMapping) {
        if (!contextId || !module) return;
		
		var setActivityGroupsCache = false, setActivityTypesCache = false, setSourceMappingsCache = false;
		
		this.activityGroups = this._getFromCache(ActivityConstants.CACHE_CATALOG_ACTIVITY_GROUPS, contextId); //context as a key
		if (!this.activityGroups || gs.nil(this.activityGroups)) {
			this.activityGroups = this._buildActivityGroups(contextId, module, fetchGroupsFromMapping);
			setActivityGroupsCache = true;
		}
		var activityGroups = (facetIds && facetIds.length) ? this.activityUtils.filterData(this.activityGroups, "facetId", facetIds) : this.activityGroups;
		
		if (!activityGroups) return;
        var groupIds = Object.keys(activityGroups);
        if (!groupIds || !groupIds.length) return;
		
		this.activityTypes = this._getFromCache(ActivityConstants.CACHE_CATALOG_ACTIVITY_TYPES, contextId);
		if(!this.activityTypes || gs.nil(this.activityTypes)) {
			this.activityTypes = this._buildActivityTypes(contextId, module, Object.keys(this.activityGroups));
			/* 
			* Edge case: if we are building cache object for activityTypes but not for activity groups then,
			* we have to flush the cache object activity groups as we are making partial updates to groups (via _updateActivityGroups())
			*/
			if(!setActivityGroupsCache)
				new GlideCacheManager().prefixFlush(ActivityConstants.CACHE_CATALOG_ACTIVITY_GROUPS, contextId);
				
			setActivityTypesCache = true;
			setActivityGroupsCache = true;
		}
		var activityTypes = this.activityUtils.filterData(this.activityTypes, "subobject.sysId", groupIds);
		
		if(!activityTypes) return;
		var activityTypeIds = Object.keys(activityTypes);
		if (!activityTypeIds || !activityTypeIds.length) return;

		this.sourceMappings = this._getFromCache(ActivityConstants.CACHE_CATALOG_ACTIVITY_SOURCE_MAPPINGS, contextId);
		if(!this.sourceMappings || gs.nil(this.sourceMappings)) {
			this.sourceMappings = this._buildSourceMapping(contextId, module, Object.keys(this.activityTypes));
			setSourceMappingsCache = true;
		}
		var sourceMappings = this.activityUtils.filterData(this.sourceMappings, "typeId", activityTypeIds);
		
		
		//Updating application cache in one go.
		if (setActivityGroupsCache)
			this._setCache(ActivityConstants.CACHE_CATALOG_ACTIVITY_GROUPS, contextId, this.activityGroups);
		
		if (setActivityTypesCache)
			this._setCache(ActivityConstants.CACHE_CATALOG_ACTIVITY_TYPES, contextId, this.activityTypes);
		
		if (setSourceMappingsCache)
			this._setCache(ActivityConstants.CACHE_CATALOG_ACTIVITY_SOURCE_MAPPINGS, contextId, this.sourceMappings);
		

		return {
            "atypeContextMapping": sourceMappings,
            "activityTypeDetails": activityTypes
        };
		
    },

    /*
     * This methods fetches Activity Groups of a given context from cache if present in the cache, else stores information in cache and returns the data
     * @param contextId : sys_id of a record in Activity Context table
     * @param facetIds : sys_ids of Facet table
     * Cache structure: Sets Activity Groups in the cache in the following format
     * actsub_activity_groups: {
     *		"contextId1" : {
     *			"sysId1": {
     *				"name": "",
     *				"table": "",
     * .             "facetId": "",
     *				"activityTypes": []
     *			},
     *			"sysId2": {}
     *		},
     *		"contextId2": {}
     *  }
     */
    getActivityGroups: function(contextId, module, facetIds, fetchGroupsFromMapping) {
        if (!contextId || !module) return;
        var activityGroups = this._getFromCache(ActivityConstants.CACHE_CATALOG_ACTIVITY_GROUPS, contextId);
        if (!activityGroups || gs.nil(activityGroups)) {
			this.buildCache(contextId, module, facetIds, fetchGroupsFromMapping);
            activityGroups = this.activityGroups;
        }
        if (facetIds && facetIds.length) return this.activityUtils.filterData(activityGroups, "facetId", facetIds);
        return activityGroups;
    },
	
	
	
    //Builds the Activity Group information for the given context
    _buildActivityGroups: function(contextId, module, fetchGroupsFromMapping) {
        var activityGroups = {},
            obj = {};

        if (!gs.nil(fetchGroupsFromMapping) && fetchGroupsFromMapping) {
            var activityGroupContextMapping = new GlideRecord(ActivityConstants.TABLE_M2M_CONTEXT_SUBOBJECT);
            activityGroupContextMapping.addQuery('activity_context', contextId);
            activityGroupContextMapping.query();
            while (activityGroupContextMapping.next()) {
                if (activityGroupContextMapping.subobject) {
                    obj = {};
                    obj["name"] = activityGroupContextMapping.subobject.name + "";
                    obj["table"] = activityGroupContextMapping.subobject.table_name + "";
                    activityGroups[activityGroupContextMapping.subobject + ""] = obj;
                }
            }
        } else {
            var facet = new GlideRecord(ActivityConstants.TABLE_ACTIVITY_FACET);
            facet.addQuery("subobject.activity_context", contextId);
            facet.addQuery("module", module);
            facet.addActiveQuery();
            facet.query();
            while (facet.next()) {
                if (facet.subobject && facet.subobject.subobject) {
                    obj = {};
                    obj["name"] = facet.subobject.subobject.name + "";
                    obj["table"] = facet.subobject.subobject.table_name + "";
                    obj["facetId"] = facet.sys_id + "";
                    activityGroups[facet.subobject.subobject + ""] = obj;
                }
            }
        }

        return activityGroups;
    },

    /*
     * This methods fetches Activity Types of a given context & gropuIds from cache if present in the cache, else stores information in cache and returns the data
     * @param contextId : sys_id of a record in Activity Context table
     * @param groupIds : sys_ids of Activity Groups
     * Cache structure: Sets Activity Types in the cache in the following format
     * actsub_activity_groups: {
     *	"contextId1": {
     *		"sysId1": { 
     *.         "message": ""
     *			"actorField": "",
     * 			"objectField": "",
     * 			"targetField": "",
     * 			"subobject": {"sysId": "", "name" : "", "subobjField": ""},
     *			"template": {
     * 				"sysId": "", 
     * 				"icon": "",
     * 				"fields": [{"label":"", "type":"", "deeplink":"", "position":"", "timeago":"", "showLabel":""}]
     * 			} 		
     *		},
     *		"sysId2": {}
     *	},
     *	"contextId2":{}
     * }
     */
    getActivityTypes: function(contextId, module, groupIds) {
        if (!contextId || !module) return;
        var activityTypes = this._getFromCache(ActivityConstants.CACHE_CATALOG_ACTIVITY_TYPES, contextId);
        if (!activityTypes || gs.nil(activityTypes)) {
			this.buildCache(contextId, module, null, true);
            activityTypes = this.activityTypes;
        }
        if (groupIds && groupIds.length) return this.activityUtils.filterData(activityTypes, "subobject.sysId", groupIds);
        return activityTypes;
    },
	

    //Sets Activity Type information in the cache
    _buildActivityTypes: function(contextId, module, groupIds) {
        if (!groupIds || !groupIds.length) return;
        var atypeSubobjMap = {};

        //get activity types associated with given activity groups
        var activityTypes = this._getGroupActivityTypes(groupIds, module, atypeSubobjMap);

        //get activity types associated with the context from the activity types came in the above step
        activityTypes = this._getContextActivityTypes(contextId, module, activityTypes);

        var activityTypeDetails = {};
        if (activityTypes && activityTypes.length) {
            //build activity type information of activityTypes
            this._buildActivityTypeData(activityTypes, activityTypeDetails, atypeSubobjMap);

            //build information of templates associated with activity type
            this._buildTemplateData(activityTypes, module, activityTypeDetails);

            //update activity type information in activity groups key
            this._updateActivityGroups(contextId, groupIds, atypeSubobjMap, activityTypes);
        }

        return activityTypeDetails;
    },

    _getGroupActivityTypes: function(groupIds, module, atypeSubobjMap) {
        var activityType = new GlideRecord(ActivityConstants.TABLE_M2M_SUBOBJECT_ACTIVITY_TYPE);
        activityType.addQuery("subobject", "IN", groupIds);
        activityType.addQuery("activity_type.active", true);
        activityType.addQuery("activity_type.module", module);
        activityType.query();
        var results = [];
        while (activityType.next()) {
            results.push(activityType.activity_type + "");
            if (activityType.subobject) {
                var obj = {};
                obj["sysId"] = activityType.subobject.sys_id + "";
                obj["name"] = activityType.subobject.table_name + "";
                obj["subobjField"] = activityType.subobject_field + "";
                atypeSubobjMap[activityType.activity_type + ""] = obj;
            }
        }
        return results;
    },

    _getContextActivityTypes: function(contextId, module, activityTypes) {
        var mapping = new GlideRecord(ActivityConstants.TABLE_SOURCE_CONTEXT_MAPPING);
        mapping.addQuery("activity_context", contextId);
        mapping.addQuery("activity_type", "IN", activityTypes);
        mapping.addQuery("module", module);
        mapping.query();
        var results = [];
        while (mapping.next()) {
            results.push(mapping.activity_type + "");
        }
        return results;
    },

    _buildActivityTypeData: function(activityTypes, activityTypeDetails, atypeSubobjMap) {
        var type = new GlideRecord(ActivityConstants.TABLE_ACTIVITY_TYPE);
        type.addQuery("sys_id", "IN", activityTypes);
        type.query();
        while (type.next()) {
            activityTypeDetails[type.sys_id + ""] = {
                "message": type.activity_nl_string ? type.activity_nl_string.key + "" : "",
                "actorField": type.actor_field + "",
                "objectField": type.object_field + "",
                "targetField": type.target_field + "",
                "subobject": atypeSubobjMap[type.sys_id + ""],
                "conditions": type.feed_conditions + ""
            };
        }
    },

    _buildTemplateData: function(activityTypes, module, activityTypeDetails) {
        var template = new GlideRecord(ActivityConstants.TABLE_ACTIVITY_TYPE_TEMPLATE);
        template.addQuery("activity_type.activity_type", "IN", activityTypes.join());
        template.addQuery("module", module);
        template.query();
        while (template.next()) {
            var typeId = template.activity_type.activity_type + "";
            if (activityTypeDetails[typeId]) {
                activityTypeDetails[typeId]["template"] = {
                    "sysId": template.sys_id + "",
                    "icon": template.icon + "",
					"icon_background":template.icon_background+"",
                    "fields": this._getTemplateFields(template.sys_id + "")
                };
            }
        }
    },

    _getTemplateFields: function(templateId) {
        if (!templateId) return;
        var fields = [];
        var templateField = new GlideRecord(ActivityConstants.TABLE_ACTIVITY_TYPE_TEMPLATE_FIELD);
        templateField.addQuery("template", templateId);
        templateField.orderBy("order");
        templateField.query();
        while (templateField.next()) {
            var fieldObj = {};
            fieldObj["label"] = templateField.name + "";
            fieldObj["type"] = templateField.type + "";
            fieldObj["deeplink"] = templateField.deeplink_to_subobject + "";
            fieldObj["position"] = templateField.position + "";
            fieldObj["timeago"] = templateField.display_as_timeago + "";
            fieldObj["showLabel"] = templateField.show_label + "";
            fieldObj["condition"] = templateField.condition + "";
            if (templateField.position=='content') {
                fieldObj["contentIcon"] = templateField.content_icon + "";
                fieldObj["contentTooltip"] = templateField.content_tooltip + "";
            }
            fields.push(fieldObj);
        }
        return fields;
    },

    _updateActivityGroups: function(contextId, groupIds, atypeSubobjMap, activityTypes) {
		//NOTE: This code is performing a partial update on existing activity groups.
        var activityGroups = this.activityGroups;
        if (activityGroups && !gs.nil(activityGroups)) {
            for (var i = 0, length = activityTypes.length; i < length; i++) {
                var groupId = atypeSubobjMap[activityTypes[i]] ? atypeSubobjMap[activityTypes[i]]["sysId"] : "";
                if (groupId && activityGroups[groupId]) {
                    if (!activityGroups[groupId]["activityTypes"]) activityGroups[groupId]["activityTypes"] = [];
                    activityGroups[groupId]["activityTypes"].push(activityTypes[i]);
                }
            }
        }
    },

    /*
     * This methods fetches Activity Type Source Mapping of a given context & gropuIds from cache if present in the cache, else stores information in cache and returns the data
     * @param contextId : sys_id of a record in Activity Context table
     * @param activityTypes : sys_ids of Activity Types
     * Cache structure: Sets Activity Types in the cache in the following format
     * actsub_activity_source_mapping: {
     *	"contextId1": {
     *		"sysId1": {
     *			"mapId": "",
     *			"sourceTable": "",
     * 			"mappingCriteria": "",
     * 			"sourceMappingField": "",
     * 			"contextMappingField": "",
     *			"advanced": "",
     *           "advancedScriptField": ""
     *		},
     *		"sysId2": {}
     *	},
     *	"contextId2":{}
     * }
     */
    getSourceMapping: function(contextId, module, activityTypes) {
        if (!contextId || !module) return;
        var sourceMapping = this._getFromCache(ActivityConstants.CACHE_CATALOG_ACTIVITY_SOURCE_MAPPINGS, contextId);
        if (!sourceMapping || gs.nil(sourceMapping)) {
			this.buildCache(contextId, module, null, true);
            sourceMapping = this.sourceMappings;
        }
        if (activityTypes && activityTypes.length) return this.activityUtils.filterData(sourceMapping, "typeId", activityTypes);
        return sourceMapping;
    },
	
    //Sets Activity Source Mapping information in the cache
    _buildSourceMapping: function(contextId, module, activityTypes) {
        if (!activityTypes ||  !activityTypes.length) return;

        var mapping = new GlideRecord(ActivityConstants.TABLE_SOURCE_CONTEXT_MAPPING);
        mapping.addQuery("activity_context", contextId);
        mapping.addQuery("activity_type", "IN", activityTypes);
        mapping.addQuery("module", module);
        mapping.query();

        var activityTypeMapping = {};
        while (mapping.next()) {
            var obj = {};
            obj["mapId"] = mapping.sys_id + "";
            obj["typeId"] = mapping.activity_type + "";
            obj["sourceTable"] = mapping.source_table + "";
            obj["fetchFromActivities"] = mapping.fetch_from_activities + "";
            obj["mappingCriteria"] = mapping.mapping_criteria + "";
            obj["sourceMappingField"] = mapping.source_mapping_field + "";
            obj["contextMappingField"] = mapping.context_mapping_field + "";
            obj["advanced"] = mapping.advanced + "";
            obj["advancedScriptField"] = "advanced_mapping_script";
            activityTypeMapping[mapping.activity_type + ""] = obj;
        }

        return activityTypeMapping;
    },

    //Methods to get/set information from application cache
    _getFromCache: function(catalog, key) {
		var object = {};
		switch(catalog) {
			case ActivityConstants.CACHE_CATALOG_ACTIVITY_GROUPS:
				object = this.actsubCache.getActivityGroups(key);
				break;
			case ActivityConstants.CACHE_CATALOG_ACTIVITY_TYPES: 
				object = this.actsubCache.getActivityTypes(key);
				break;
			case ActivityConstants.CACHE_CATALOG_ACTIVITY_SOURCE_MAPPINGS:
				object = this.actsubCache.getActivitySourceMappings(key);
				break;
		}
        return j2js(object);
    },

	_setCache: function(catalog, key, object) {

		switch(catalog) {
			case ActivityConstants.CACHE_CATALOG_ACTIVITY_GROUPS:
				this.actsubCache.putActivityGroups(key, object);
				break;
			case ActivityConstants.CACHE_CATALOG_ACTIVITY_TYPES: 
				this.actsubCache.putActivityTypes(key, object);
				break;
			case ActivityConstants.CACHE_CATALOG_ACTIVITY_SOURCE_MAPPINGS:
				this.actsubCache.putActivitySourceMappings(key, object);
				break;
		}
    },

	
    type: 'ActivityContextCacheSNC'
};
