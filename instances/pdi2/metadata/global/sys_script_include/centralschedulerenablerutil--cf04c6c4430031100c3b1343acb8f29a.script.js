var CentralSchedulerEnablerUtil = Class.create();
CentralSchedulerEnablerUtil.prototype = {
    CENTRAL_SCHEDULER_ENABLE: "glide.central_scheduler.enable",
    initialize: function() {},

    csTurnOn: function() {
        var csSysProperty = new GlideRecord("sys_properties");
        csSysProperty.initialize();
        csSysProperty.setValue("name", this.CENTRAL_SCHEDULER_ENABLE);
        csSysProperty.setValue("description", "Enables central scheduler property (the property should not be altered)");
        csSysProperty.setValue("ignore_cache", true);
        csSysProperty.setValue("sys_policy", "read");
        csSysProperty.setValue("type", "boolean");
        csSysProperty.setValue("value", true);
        if (csSysProperty.isValidField("read_roles"))
            csSysProperty.setValue("read_roles", "maint");
        if (csSysProperty.isValidField("write_roles"))
            csSysProperty.setValue("write_roles", "maint");
        var newRecordId = csSysProperty.insert();
        gs.info("[Enable-Central-Scheduler] Enabling central scheduler "+ newRecordId);
    },

    csEnabled: function() {
        return GlideProperties.getBoolean(this.CENTRAL_SCHEDULER_ENABLE);
    },

    isSafeToProceed: function() {
        try {
            var isUpgrading = SNC.UpgradeAPI.isUpgradeInProgress();
            if (isUpgrading === undefined) {
                return false;
            }
            if (isUpgrading === true) {
                return false;
            }
            return true;
        } catch (ex) {
            gs.info("[CS FixScript Job] Exception thrown while checking isUpgradeInProgress(): " + ex);
            return false;
        }
    },

    enableCentralScheduler: function(){
        if (this.csEnabled() || !this.areJobCriteriaFieldsCompatibleWithCentralScheduler()) {
            this.destroyJob();
            return;
        }
        if (this.isSafeToProceed()) {
            this.csTurnOn();
            this.destroyJob();
        }
    },

    destroyJob: function(){
        var gr = new GlideRecord("sys_trigger");
        if (gr.get("abdc7ff0a3023110cff61f9e341e611f")) {
            gs.info("[Enable-Central-Scheduler] Deleting trigger abdc7ff0a3023110cff61f9e341e611f");
            gr.setWorkflow(false);
            gr.deleteRecord();
        }
    },

    areJobCriteriaFieldsCompatibleWithCentralScheduler: function() {
        var compatible = true;
        var allInvalidFields = [];
		var au = new ArrayUtil();

        var nodeTypeRecords = new GlideRecord("sys_node_type");
        nodeTypeRecords.addNotNullQuery("job_criteria");
        nodeTypeRecords.query();

        while (nodeTypeRecords.next()) {
            var jobCriteriaQuery = nodeTypeRecords.getValue("job_criteria");
			var deserializedQuery = SNC.JobCriteriaAPI.getDeserializedQuery(jobCriteriaQuery);
            var invalidFields = SNC.JobCriteriaAPI.getInvalidJobCriteriaFields(deserializedQuery);

            // If invalid fields exist on this row, then add to the list of all invalid fields and set compatible to false
            if (invalidFields !== "") {
				au.concat(allInvalidFields, invalidFields.split(", "));
                compatible = false;
            }
        }

        // if there are any invalid fields, remove any duplicates and print
        if (!compatible) {
            var nonDupeInvalidFields = au.unique(allInvalidFields);
            gs.info("[Enable-Central-Scheduler] Cannot enable Central Scheduler. Invalid field values used in sys_node_type.job_criteria: " + nonDupeInvalidFields.join(", "));
        }

        return compatible;
    },

    type: 'CentralSchedulerEnablerUtil'
};
