var CloudResourceDiscoveryCountHandler = Class.create();

//Using static LRU cache to optimize the number of select queries on discovery_cloud_temp_results table
CloudResourceDiscoveryCountHandler.cache = new GlideLRUCache(10000);
CloudResourceDiscoveryCountHandler.prototype = {

	DISCOVERY_CLOUD_RESULTS: 'discovery_cloud_results',
	DISCO_STATUS: 'status',
	DISCO_SCHEDULE: 'schedule',
	CLOUD_RESOURCE_NAME: 'cloud_resource_name',
	CLOUD_RESOURCE_COUNT: 'cloud_resource_count',

	DISCOVERY_CLOUD_TEMP_RESULTS: 'discovery_cloud_temp_results',
	CI_NAME: 'ci_name',
	CI_SYS_ID: 'ci_sys_id',
	COUNT: 'COUNT',

	DISCOVERY_STATUS: 'discovery_status',
	DISCOVERY_SCHEDULER: 'dscheduler',

    initialize: function() {
    },

	/*
	* Returns a list of all objects which extend the current object will also get their extensions and infinitum
	* Example, given cmdb_ci this will return: cmdb_server -> cmdb_windows_server, etc going from one child to the next child
	*
	* Input Parameter(s)
	* @param parentCI - CI name (table name) for which extended child tables are to be fetched
	*/
	fetchAllChildCIsForParentCI: function(parentCI) {
		var j;
		var finalCIsList = [];
		var allCIs = this._getTableExtensionsForParent(parentCI);
		var ignoredCIsList = ['cmdb_ci_cloud_service_account', 'cmdb_ci_logical_datacenter'];

		//Ignoring the tables extending "cmdb_ci_logical_datacenter" as well
		ignoredCIsList = ignoredCIsList.concat(this._getTableExtensionsForParent('cmdb_ci_logical_datacenter'));

		//Finalising the list to initialise the counts of resources to 0
		for (j in allCIs) {
			if ((ignoredCIsList.indexOf(allCIs[j]) < 0) && (allCIs[j].indexOf('endpoint') < 0))
				finalCIsList.push(allCIs[j]);
		}

		return finalCIsList;
	},

	/*
	* Inserts the Resources's sys_ids into 'Discovery Cloud Temp Results' table when a discovery is triggered via
	* CAPI or Pattern, for a given discovery status.
	*
	* Input Parameters
	* @param outputPayload - Payload provided by the Identification engine after persisting
	* discovered data into CMDB.
	* @param discoStatusID - The sys_id of the Discovery Status
	*/
	cacheCloudResourcesDiscovered : function(outputPayload, discoStatusID) {
		var selectGR,insertGR,verifyGr;
		var ciRecordGR;
		var rawPayload = global.JSON.parse(outputPayload);
		var finalCIsList = this.fetchAllChildCIsForParentCI('cmdb_ci');

		if (JSUtil.notNil(rawPayload) && rawPayload.hasOwnProperty('items')) {
			var excludedCIs = gs.getProperty('glide.discovery.cloud_discovery_result.tables_to_exclude','');
			var excludedCIsList = excludedCIs.replace(/\s+/g, '').split(',');
			rawPayload.items.forEach(function(element) {
				if(excludedCIsList.indexOf(element.className) == -1 && finalCIsList.indexOf(element.className) != -1 && element.sysId && element.sysId != 'Unknown') {
					var key  = element.sysId + " : " + element.className + " : " + discoStatusID;
					// if record is not present in the cache
					if(!CloudResourceDiscoveryCountHandler.cache.get(key)) {
						//Check if the record already exists in table.
						selectGR = new GlideRecord('discovery_cloud_temp_results');
						selectGR.addQuery('ci_sys_id', element.sysId);
						selectGR.addQuery('ci_name', element.className);
						selectGR.addQuery('status', discoStatusID);
						selectGR.query();
						if (!selectGR.next()) {
							//Check the table exists with className and verify sysId is presented in the cmdb_ci record. Sometime getting CI className with 'Lable' text and sysId valus is null(i.e. invalid Data)
							if (gs.tableExists(element.className)) {
								ciRecordGR = new GlideRecord(element.className);
								if (ciRecordGR.get(element.sysId)) {
									//Trying to prevent race condition by querying again
									verifyGr = new GlideRecord('discovery_cloud_temp_results');
									verifyGr.addQuery('ci_sys_id', element.sysId);
									verifyGr.addQuery('ci_name', element.className);
									verifyGr.addQuery('status', discoStatusID);

									insertGR = new GlideRecord('discovery_cloud_temp_results');
									insertGR.initialize();
									insertGR.setValue('ci_name', element.className);
									insertGR.setValue('status', discoStatusID);
									insertGR.setValue('ci_sys_id', element.sysId);

									verifyGr.query();
									if(!verifyGr.next()) {
										insertGR.insert();
									}
								}
							}
						}
					CloudResourceDiscoveryCountHandler.cache.put(key, true);  // add record to cache
				}	
			}
		});
	}
},

	/*
	* Checks with the 'Discovery Cloud Temp Results' table to see if any discovered resources data is available
	* for the provided discovery run i.e., discovery status.
	*
	* Based on the available data, update the count for the respective discovery status in the "Discovery Cloud Results"
	* table
	*
	* Input Parameters
	* @param discoStatusID - The sys_id of the Discovery Status
	*/
	persistCachedDiscoveryResultsToCountTable: function(discoStatusID) {
		
		var scheduleID = this.getScheduleIDFromStatus(discoStatusID);

        var resultsGR = new GlideAggregate(this.DISCOVERY_CLOUD_TEMP_RESULTS);
        resultsGR.addQuery(this.DISCO_STATUS, discoStatusID);
        resultsGR.groupBy(this.CI_NAME);
        resultsGR.addAggregate(this.COUNT);
        resultsGR.query();
        while (resultsGR.next()) {
            this.setCloudResourceCount(scheduleID, discoStatusID, resultsGR.getValue(this.CI_NAME), resultsGR.getAggregate(this.COUNT));
        }
	},

	/*
	* Once resource count is updated successful then wipe out the data of a given dicovery status, in the
	* "Discovery Cloud Temp Results" table that serves as a cache table until discovery is completed.
	*
	* Input Parameters
	* @param discoStatusID - The sys_id of the Discovery Status
	*/
	cleanUpCachedDiscoveryResults: function(discoStatusID) {
		var gr = new GlideMultipleDelete(this.DISCOVERY_CLOUD_TEMP_RESULTS);
		gr.addQuery(this.DISCO_STATUS, discoStatusID);
		gr.execute();
	},
	
	/*
	* Updates the Resources Count into 'Discovery Cloud Results' table.
	*
	* Input Parameters
	* @param scheduleID - Discovery Schedule Sys ID
	* @param discoStatusID - Current Discovery Status Sys ID
	* @param cmdbTableName - Resource Name. e.g., cmdb_ci_vm_instance
	* @param count - Resource Count i.e., the count of resources discovered
	*/
	setCloudResourceCount : function(scheduleID, discoStatusID, cmdbTableName, count) {
		var setCountGR = new GlideRecord(this.DISCOVERY_CLOUD_RESULTS);
		setCountGR.initialize();
		setCountGR.setValue(this.DISCO_STATUS, discoStatusID);
		setCountGR.setValue(this.CLOUD_RESOURCE_NAME, cmdbTableName);
		setCountGR.setValue(this.CLOUD_RESOURCE_COUNT, count);

		if (scheduleID)
			setCountGR.setValue(this.DISCO_SCHEDULE, scheduleID);

		setCountGR.insert();
	},
	
	saveCloudResourceCount : function(discoStatusID, resource, count) {
		var scheduleID = this.getScheduleIDFromStatus(discoStatusID);
		
		this.persistvCenterDiscoveryCloudResults(scheduleID, discoStatusID, resource, count);
	},

	/*
	* Currently, used for vCenter Only.
	*
	* This script updates the Resources Count into 'Discovery Cloud Results' table when a vCenter discovery is running. 
	* The hooks added for the vCenter Sensors takes care of invoking this methog and thereby updating the resource counts.
	*
	* "GlideMultipleUpdate" is used to avoid the DB lock situation as we're updating the count while discovery run
	* is still in progress
	*
	* Input Parameters
	* @param scheduleID - Discovery Schedule Sys ID
	* @param discoStatusID - Current Discovery Status Sys ID
	* @param resource - Resource Name. e.g., cmdb_ci_vm_instance
	* @param resourceCount - Resource Count i.e., the count of resources discovered
	*/
	persistvCenterDiscoveryCloudResults : function(scheduleID, discoStatusID, resource, resourceCount) {
		var updateCountGR = GlideMultipleUpdate(this.DISCOVERY_CLOUD_RESULTS);
		updateCountGR.setIncrement(this.CLOUD_RESOURCE_COUNT, resourceCount);
		updateCountGR.addQuery(this.DISCO_STATUS, discoStatusID);
		updateCountGR.addQuery(this.DISCO_SCHEDULE, scheduleID);
		updateCountGR.addQuery(this.CLOUD_RESOURCE_NAME, resource);
		updateCountGR.execute();
	},

	getScheduleIDFromStatus : function(discoStatusID) {
		var scheduleID = '';
		var statusGR = new GlideRecord(this.DISCOVERY_STATUS);
		if (statusGR.get(discoStatusID))
			scheduleID = statusGR.getValue(this.DISCOVERY_SCHEDULER);
		
		return scheduleID;
	},
	
	_getTableExtensionsForParent: function(parentCI) {
		var tables = GlideDBObjectManager.get().getTableExtensions(parentCI);
		tables = new JSON().decode(tables);
		return tables;
	},

    type: 'CloudResourceDiscoveryCountHandler'
};
