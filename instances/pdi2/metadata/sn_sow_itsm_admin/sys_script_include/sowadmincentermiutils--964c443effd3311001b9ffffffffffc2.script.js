var SOWAdminCenterMIUtils = Class.create();
SOWAdminCenterMIUtils.prototype = {
    initialize: function() {},
    deleteTriggerRules: function(recordsToDelete) {
        var miTriggerRuleGR = new GlideRecord("major_incident_trigger_rule");
        miTriggerRuleGR.addQuery("sys_id", "IN", recordsToDelete);
        miTriggerRuleGR.deleteMultiple();
    },
    activateTriggerRules: function(recordsToActivate) {
        var miTriggerRuleGR = new GlideRecord("major_incident_trigger_rule");
        miTriggerRuleGR.addQuery("sys_id", "IN", recordsToActivate);
        miTriggerRuleGR.query();
        miTriggerRuleGR.setValue("active", true);
        miTriggerRuleGR.updateMultiple();
    },
    deactivateTriggerRules: function(recordsToDeactivate) {
        var miTriggerRuleGR = new GlideRecord("major_incident_trigger_rule");
        miTriggerRuleGR.addQuery("sys_id", "IN", recordsToDeactivate);
        miTriggerRuleGR.query();
        miTriggerRuleGR.setValue("active", false);
        miTriggerRuleGR.updateMultiple();
    },
    copyTriggerRule: function(recordToCopy, newRecordName) {
        var miTriggerRuleGR = new GlideRecord("major_incident_trigger_rule");
        miTriggerRuleGR.addQuery("sys_id", "IN", recordToCopy);
        miTriggerRuleGR.query();
        if (miTriggerRuleGR.next()) {
            miTriggerRuleGR.setValue("name", newRecordName);
            miTriggerRuleGR.insert();
        }
    },
    copyCommunicationPlanDefinitions: function(recordsToCopy) {
        var planDefGR = new GlideRecord("comm_plan_definition");
        planDefGR.addQuery("sys_id", "IN", recordsToCopy);
        planDefGR.query();
        while (planDefGR.next()) {
            planDefGR.insert();
        }
    },
    activateCommunicationPlanDefinitions: function(recordsToActivate) {
        var planDefGR = new GlideRecord("comm_plan_definition");
        planDefGR.addQuery("sys_id", "IN", recordsToActivate);
        planDefGR.query();
        planDefGR.setValue("active", true);
        planDefGR.updateMultiple();
    },
    deactivateCommunicationPlanDefinitions: function(recordsToDeactivate) {
        var planDefGR = new GlideRecord("comm_plan_definition");
        planDefGR.addQuery("sys_id", "IN", recordsToDeactivate);
        planDefGR.query();
        planDefGR.setValue("active", false);
        planDefGR.updateMultiple();
    },
    deleteCommunicationPlanDefinitions: function(recordsToDelete) {
        var planDefGR = new GlideRecord("comm_plan_definition");
        planDefGR.addQuery("sys_id", "IN", recordsToDelete);
        planDefGR.query();
        while (planDefGR.next()) {
            var contactDefGR = new GlideRecord("comm_contact_definition");
            contactDefGR.addQuery("comm_plan_definition", planDefGR.getUniqueValue());
            contactDefGR.query();
            contactDefGR.deleteMultiple();

            var taskDefGR = new GlideRecord("comm_task_definition");
            taskDefGR.addQuery("comm_plan_definition", planDefGR.getUniqueValue());
            taskDefGR.query();
            while (taskDefGR.next()) {
                this.deleteCommunicationChannelDefinitions(taskDefGR.getUniqueValue());
                taskDefGR.deleteRecord();
            }
            planDefGR.deleteRecord();
        }
    },
    deleteCommunicationChannelDefinitions: function(taskSysId) {
        var channelDefGR = new GlideRecord("comm_channel_definition");
        channelDefGR.addQuery("comm_task_definition", taskSysId);
        channelDefGR.query();
        channelDefGR.deleteMultiple();
    },
    copyCommunicationTaskDefinitions: function(recordsToDelete) {
        var taskDefGR = new GlideRecord("comm_task_definition");
        taskDefGR.addQuery("sys_id", "IN", recordsToDelete);
        taskDefGR.query();
        while (taskDefGR.next()) {
            taskDefGR.insert();
        }
    },
    deleteCommunicationTaskDefinitions: function(recordsToDelete) {
        var taskDefGR = new GlideRecord("comm_task_definition");
        taskDefGR.addQuery("sys_id", "IN", recordsToDelete);
        taskDefGR.query();
        while (taskDefGR.next()) {
            this.deleteCommunicationChannelDefinitions(taskDefGR.getUniqueValue());
            taskDefGR.deleteRecord();
        }
    },
    activateCommunicationTaskDefinitions: function(recordsToActivate) {
        var taskDefGR = new GlideRecord("comm_task_definition");
        taskDefGR.addQuery("sys_id", "IN", recordsToActivate);
        taskDefGR.query();
        taskDefGR.setValue("active", true);
        taskDefGR.updateMultiple();
    },
    deactivateCommunicationTaskDefinitions: function(recordsToDeactivate) {
        var taskDefGR = new GlideRecord("comm_task_definition");
        taskDefGR.addQuery("sys_id", "IN", recordsToDeactivate);
        taskDefGR.query();
        taskDefGR.setValue("active", false);
        taskDefGR.updateMultiple();
    },
    getChannelById: function(channels, channelId) {
        for (var i = 0; i < channels.length; i++) {
            if (channels[i].id === channelId) {
                return channels[i];
            }
        }
    },
    copyCommunicationTaskDefinition: function(recordToCopy, newRecordName, channelMap) {
        var newRecordSysId = "-1";
        if (typeof recordToCopy == "string") {
            var taskDefGR = new GlideRecord("comm_task_definition");
            taskDefGR.addQuery("sys_id", recordToCopy);
            taskDefGR.query();
            if (taskDefGR.next()) {
                recordToCopy = taskDefGR;
            }
        }
        if (recordToCopy) {
            var recordToCopySysId = recordToCopy.getUniqueValue();
            recordToCopy.setValue("name", newRecordName);
            newRecordSysId = recordToCopy.insert();
            if (newRecordSysId) {
                var channelDefGR = new GlideRecord("comm_channel_definition");
                channelDefGR.addQuery("comm_task_definition", recordToCopySysId);
                channelDefGR.query();
                while (channelDefGR.next()) {
                    var channelTypeId = channelDefGR.channel.sys_id + "";
                    var channelDefTable = this.getChannelById(channelMap, channelTypeId)["def_table"];
                    var channelDefTableGR = new GlideRecord(channelDefTable);
                    channelDefTableGR.addQuery("comm_task_definition", recordToCopySysId);
                    channelDefTableGR.query();
                    while (channelDefTableGR.next()) {
                        channelDefTableGR.setValue("comm_task_definition", newRecordSysId);
                        channelDefTableGR.insert();
                    }
                }
            }
        }
    },
    getChannelMapWithChannelId: function() {
        var channelMap = new sn_comm_management.CommunicationManagementUtil().getChannelMap();
        var channelConfig = new GlideRecord("comm_channel_config");
        channelConfig.query();
        var channels = [];
        while (channelConfig.next()) {
            var type = channelConfig.getValue("type");
            var channel = channelMap[type];
            if (!gs.nil(channel)) {
                channel.id = channelConfig.getUniqueValue();
                channels.push(channel);
            }
        }
        return channels;
    },
    copyCommunicationPlanDefinition: function(recordToCopy, newRecordName, shouldCopyTask) {
        var channelMap = this.getChannelMapWithChannelId();
        var planDefGR = new GlideRecord("comm_plan_definition");
        planDefGR.addQuery("sys_id", recordToCopy);
        planDefGR.query();
        if (planDefGR.next()) {
            planDefGR.setValue("name", newRecordName);
            newRecordSysId = planDefGR.insert();
            if (newRecordSysId) {
                var contactDefGR = new GlideRecord("comm_contact_definition");
                contactDefGR.addQuery("comm_plan_definition", recordToCopy);
                contactDefGR.query();
                while (contactDefGR.next()) {
                    contactDefGR.setValue("comm_plan_definition", newRecordSysId);
                    contactDefGR.insert();
                }
                if (shouldCopyTask) {
                    var taskDefGR = new GlideRecord("comm_task_definition");
                    taskDefGR.addQuery("comm_plan_definition", recordToCopy);
                    taskDefGR.query();
                    while (taskDefGR.next()) {
                        taskDefGR.setValue("comm_plan_definition", newRecordSysId);
                        this.copyCommunicationTaskDefinition(taskDefGR, taskDefGR.getValue("name"), channelMap);
                    }
                }
            }
        }
    },
    type: 'SOWAdminCenterMIUtils'
};
