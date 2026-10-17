var ActivityFacetDAO = Class.create();
ActivityFacetDAO.prototype = {
	initialize: function(activitySubContext) {
		this.ActivityContextDao = new ActivityContextDao(activitySubContext);
		this.cache = new ActivityContextCache();
	},

	getFacetsInfo: function(actContext, sysId, additionalParams) {
		var activityFacets = new GlideRecord(ActivityConstants.TABLE_ACTIVITY_FACET);
		if (additionalParams.facetIds)
			activityFacets.addQuery('sys_id', 'IN', additionalParams.facetIds);
		activityFacets.addQuery('subobject.activity_context', actContext);
		activityFacets.addActiveQuery();
		activityFacets.orderBy('order');
		activityFacets.addQuery('module', additionalParams.module);
		activityFacets.query();
		var activityFacetsInfo = [];
		var currentStaticInfo = {
			"currStaticGroup": '',
			"currStaticGroupLabel": ''
		};

		//If session cache is not available, building all the config related cache for first time, currenlty not doing changes for dynamic building of cache.
		//Reason: If entire cache is not built, for first dynamic child can build it's cahce, but the subsequent facets try to fech from existing cache based on only context id and not based on the facet id or activity type or source mapping which results in empty objects,it founds context id object but it won't have all the data.

		this.cache.buildCache(actContext, additionalParams.module);
		while (activityFacets.next()) {
			if (activityFacets.getValue('facet_type') == ActivityConstants.DYNAMIC_FACET) {
				currentStaticInfo.currStaticGroup = '';
				currentStaticInfo.currStaticGroupLabel = '';
				this._buildDynamicFacetInfo(actContext, activityFacetsInfo, activityFacets, additionalParams);
			} else
				this._buildStaticFacetInfo(actContext, activityFacetsInfo, activityFacets, currentStaticInfo, additionalParams);
		}
		return activityFacetsInfo;
	},

	_buildDynamicFacetInfo: function(actContext, activityFacetsInfo, activityFacets, additionalParams) {
		var facetInfo = {
			'name': activityFacets.name + '',
			'is_dynamic': true,
			'facets': [activityFacets.sys_id + ''],
			'icon': activityFacets.icon + '',
			'children': []
		};

		//fetch dynamic child info, if lazyLoad is true
		if (additionalParams.lazyLoad != 'true') {
			facetInfo.children = this._fetchActivitiesInfo(actContext, false, activityFacets, additionalParams);
			if (additionalParams.getActCount == 'true')
				facetInfo['activity_count'] = facetInfo.children.length;
		}

		activityFacetsInfo.push(facetInfo);
	},

	_buildStaticFacetInfo: function(actContext, activityFacetsInfo, activityFacets, currentStaticInfo, additionalParams) {
		var group = activityFacets.facet_group.getDisplayValue() + '';
		if (!currentStaticInfo.currStaticGroup || group != currentStaticInfo.currStaticGroupLabel) {
			currentStaticInfo.currStaticGroupLabel = group;
			currentStaticInfo.currStaticGroup = {
				"name": currentStaticInfo.currStaticGroupLabel,
				'is_dynamic': false,
				'facets': [],
				'children': []
			};
			if (additionalParams.lazyLoad != 'true' && additionalParams.getActCount == 'true')
				currentStaticInfo.currStaticGroup['activity_count'] = 0;
			activityFacetsInfo.push(currentStaticInfo.currStaticGroup);
		}
		var facetInfo = {
			"title": activityFacets.name + '',
			'facet': activityFacets.sys_id + '',
			'icon': activityFacets.icon + '',
		};
		if (additionalParams.lazyLoad != 'true' && additionalParams.getActCount == 'true') {
			var activityCount = this._fetchActivitiesInfo(actContext, true, activityFacets, additionalParams);
			facetInfo['activity_count'] = activityCount;
			currentStaticInfo.currStaticGroup['activity_count'] += activityCount;
		}
		if (!currentStaticInfo.currStaticGroup.name) {
			currentStaticInfo.currStaticGroup.name = facetInfo.title;
			currentStaticInfo.currStaticGroup['icon'] = facetInfo.icon;
		} else
			currentStaticInfo.currStaticGroup.children.push(facetInfo);
		currentStaticInfo.currStaticGroup.facets.push(facetInfo.facet);
	},

	_fetchActivitiesInfo: function(actContext, isStaticFacet, activityFacets, additionalParams) {
		var facetDataToFetchActivities;
		if (!isStaticFacet) {
			var fieldList = activityFacets.subobject_fields + '';
			facetDataToFetchActivities = {
				"titleField": activityFacets.title_field + '',
				"fieldList": (fieldList) ? fieldList.split(',') : [],
				"isStaticFacet": false
			};
		}
		else
			facetDataToFetchActivities = {
				"isStaticFacet": true
			};
		var subobject = activityFacets.subobject;
		if (subobject) subobject = subobject.subobject;
		if (subobject)
			facetDataToFetchActivities["subObjectTable"] = subobject.table_name + '';
		var actReqObj = {
			"contextId": actContext,
			"actualContextGr": this.contextGR,
			"facetIds": activityFacets.sys_id + '',
			"facetInfo": facetDataToFetchActivities,
			'startDate': additionalParams.startDate,
			'endDate': additionalParams.endDate,
			'module': additionalParams.module
		};
		return this.ActivityContextDao.getActivities(actReqObj);
	},

	getActivityContextInfo: function(actContext, sysId) {
		var activityContext = new GlideRecord(ActivityConstants.TABLE_ACTIVITY_CONTEXT);
		activityContext.addActiveQuery();
		activityContext.addQuery('sys_id', actContext);
		activityContext.addQuery('module.active', true);
		activityContext.query();
		if (activityContext.next()) {
			var contextTable = activityContext.context_table + '';
			var contextInfo = new GlideRecord(contextTable);
			contextInfo.addQuery('sys_id', sysId);
			//Do not run BRs, customer_contact has a query BR which is skipping inactive users.
			contextInfo.setWorkflow(false); 
			contextInfo.query();
			if (contextInfo.next()) {
				this.contextGR = contextInfo;
				return {
					'context_name': activityContext.name + '',
					'context_table': contextTable,
					'context_id': actContext,
					'module': activityContext.module + ''
				};
			}
			return;
		}
		return;
	},

	getActContextSubObjects: function(actContext) {
		var actContextSubObj = new GlideRecord(ActivityConstants.TABLE_M2M_CONTEXT_SUBOBJECT);
		actContextSubObj.addQuery('activity_context', actContext);
		actContextSubObj.query();
		var actContextSubObjList = [];
		while (actContextSubObj.next())
			actContextSubObjList.push(actContextSubObj.sys_id + '');
		return actContextSubObjList;
	},

	type: 'ActivityFacetDAO'
};
