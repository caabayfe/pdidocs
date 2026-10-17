var EmPopulateImpactedServices = Class.create();
EmPopulateImpactedServices.prototype = {
    initialize: function() {

		this.commentInScriptSuccess = '/* This scheduled job was deactivated intentionally after populating em_impacted_service and em_impact_inclusion_class tables. Do not activate this job */ \n';
		this.commentInScriptNotRunEnabledProperty = '/* This scheduled job was deactivated intentionally since evt_mgmt.impact_filter_services_enabled property is false. Do not activate this job */ \n';
		this.commentInScriptNotRunReadyProperty = '/* This scheduled job was deactivated intentionally since evt_mgmt.impact_filter_services_ready property is true. Do not activate this job */ \n';
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

        var uniqueClasses = {}; // Use an object to store unique class names
		var gr = new GlideRecord(serviceAutoTable);
        gr.query();

		while (gr.next()) {
			// Copy service to em_impacted_service
			var jsonObj = {};
			jsonObj.service = '' + gr.sys_id;
			jsonObj.operational_status = '' + gr.operational_status;
			jsonObj.bucket = '' + gr.bucket;
			jsonObj.service_sys_class_name = '' + gr.sys_class_name;
			jsonObj.severity = '' + gr.severity;
			jsonArr.push(jsonObj);
			counter++;

			if(counter >= bulkSize){
				batchUtil.batchInsertMultiple(JSON.stringify(jsonArr), impactedServiceTable, '');
				counter = 0;
				jsonArr = [];
			}
			// Store unique class names in an object
			uniqueClasses[gr.sys_class_name] = true;
		}
		if(counter > 0){
			//insert rest of records in batch
			batchUtil.batchInsertMultiple(JSON.stringify(jsonArr), impactedServiceTable, '');
		}
        // Insert unique classes after all records are processed
        this.insertUniqueClasses(uniqueClasses);
		this.disablePopulateImpactScheduledJob(this.commentInScriptSuccess);
		gs.setProperty("evt_mgmt.impact_filter_services_ready", true);
		gs.setProperty("evt_mgmt.impact_filter_services_queries_enabled", true);
        gs.info("EmPopulateImpactedServices: Completed copying services and unique classes.");
    },

	canExecute: function() {

        var isEnabled = gs.getProperty("evt_mgmt.impact_filter_services_enabled", 'true');
		if (isEnabled === "false") {
			gs.info("EmPopulateImpactedServices: 'Event Management - Populate Impacted Services Table' job was deactivated intentionally since evt_mgmt.impact_filter_services_enabled property is false.");
			this.disablePopulateImpactScheduledJob(this.commentInScriptNotRunEnabledProperty);
			return false;
		}
		var isReady = gs.getProperty("evt_mgmt.impact_filter_services_ready", 'false');
		if (isReady == "true") {
			gs.info("EmPopulateImpactedServices: 'Event Management - Populate Impacted Services Table' job was deactivated intentionally since evt_mgmt.impact_filter_services_ready property is true.");
			this.disablePopulateImpactScheduledJob(this.commentInScriptNotRunReadyProperty);
			return false;
		}
		return true;
    },

	insertUniqueClasses: function(classDict) {
		var impactedClass = new GlideRecord("em_impact_inclusion_class");
        for (var className in classDict) {
            impactedClass.initialize();
            impactedClass.table = className;
            impactedClass.insert();
        }
    },

	disablePopulateImpactScheduledJob: function(commentInScript) {
        var scheduledJob = new GlideRecord('sysauto_script');
        var jobExists = scheduledJob.get('7dfc06907f14221097bef39c6d8665a8'); // Event Management - Populate Impacted Services Table
        if (jobExists) {
            scheduledJob.setValue('active', 'false');
			scheduledJob.setValue('name', scheduledJob.getValue('name')+ ' - Deactivated');
            scheduledJob.setValue('script', commentInScript + scheduledJob.getValue('script'));
            scheduledJob.update();
        }
    },
	type: 'EmPopulateImpactedServices'
};
