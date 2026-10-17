var EmSyncSeveritiesInImpactedServices = Class.create();
EmSyncSeveritiesInImpactedServices.prototype = {
    initialize: function() {

		this.commentInScriptSuccess = '/* This scheduled job was deactivated intentionally after synchronized the severities of em_impacted_service table. Do not activate this job */ \n';
		this.commentInScriptNotRunEnabledProperty = '/* This scheduled job was deactivated intentionally since evt_mgmt.impact_filter_services_enabled property is false. Do not activate this job */ \n';
		this.commentInScriptNotRunReadyProperty = '/* This scheduled job was deactivated intentionally since evt_mgmt.impact_filter_services_ready property is false. Do not activate this job */ \n';
    },

    execute: function() {

		if (!this.canExecute()) {
			return;
		}
		var serviceAutoTable = "cmdb_ci_service_auto";
        var impactedServiceTable = "em_impacted_service";

		var jsonArr = [];
		var counter = 0;
		var bulkSize = GlideProperties.getInt("evt_mgmt.batchInsertSingleField.bulk_size", 500);
		var batchUtil = new SNC.BatchCommandsUtil();

		var impactedServiceGR = new GlideRecord(impactedServiceTable);
		impactedServiceGR.query();

		while (impactedServiceGR.next()) {
			var jsonObj = {};

			var serviceAutoGR = new GlideRecord(serviceAutoTable);
			if (serviceAutoGR.get(impactedServiceGR.service)) {
				var updatedSeverity = serviceAutoGR.severity;
				if (impactedServiceGR.severity != updatedSeverity) {
					jsonObj.sys_id = '' + impactedServiceGR.sys_id;
					jsonObj.severity = '' + updatedSeverity;
					jsonArr.push(jsonObj);
					counter++;

					if(counter >= bulkSize){
						batchUtil.batchUpdateMultiple(JSON.stringify(jsonArr), impactedServiceTable, '');
						counter = 0;
						jsonArr = [];
					}
				}
			}
		}
		if(counter > 0){
			//update rest of records in batch
			batchUtil.batchUpdateMultiple(JSON.stringify(jsonArr), impactedServiceTable, '');
		}
		this.disablePopulateImpactScheduledJob(this.commentInScriptSuccess);
		gs.setProperty("evt_mgmt.impact_filter_services_dashboard_enabled", true);
        gs.info("EmSyncSeveritiesInImpactedServices: Severity synchronization completed.");
    },

	canExecute: function() {

        var isEnabled = gs.getProperty("evt_mgmt.impact_filter_services_enabled", 'true');
		if (isEnabled === "false") {
			gs.info("EmSyncSeveritiesInImpactedServices: 'Event Management - Sync Impacted Services Table' job was deactivated intentionally since evt_mgmt.impact_filter_services_enabled property is false.");
			this.disablePopulateImpactScheduledJob(this.commentInScriptNotRunEnabledProperty);
			return false;
		}
		var isReady = gs.getProperty("evt_mgmt.impact_filter_services_ready", 'true');
		if (isReady == "false") {
			gs.info("EmSyncSeveritiesInImpactedServices: 'Event Management - Sync Impacted Services Table' job was deactivated intentionally since evt_mgmt.impact_filter_services_ready property is false.");
			this.disablePopulateImpactScheduledJob(this.commentInScriptNotRunReadyProperty);
			return false;
		}
		return true;
    },

	disablePopulateImpactScheduledJob: function(commentInScript) {
        var scheduledJob = new GlideRecord('sysauto_script');
        var jobExists = scheduledJob.get('b09c32c3ff32221097beffffffffffd5'); // Event Management - Sync Impacted Services Table
        if (jobExists) {
            scheduledJob.setValue('active', 'false');
			scheduledJob.setValue('name', scheduledJob.getValue('name')+ ' - Deactivated');
            scheduledJob.setValue('script', commentInScript + scheduledJob.getValue('script'));
            scheduledJob.update();
        }
    },
	type: 'EmSyncSeveritiesInImpactedServices'
};
