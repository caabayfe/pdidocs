var VADeflectionTracking = Class.create();

VADeflectionTracking.prototype = {
    initialize: function() {
        this.SSA_DEFLECTION_CONFIGURATION = "ssa_deflection_configuration";
        this.SSA_DEFLECTION_PATTERN = "ssa_deflection_pattern";
        this.SSA_DEFLECTION_METRIC = "ssa_deflection_metric";
        this.SSA_DEFLECTION_METRIC_ACTIVITY = "ssa_deflection_metric_activity";
        this.SYS_CS_CONVERSATION_TASK = "sys_cs_conversation_task";
        this.SYS_CS_TOPIC = "sys_cs_topic";
        this.SYS_CB_TOPIC = "sys_cb_topic";
        this.TOPIC_TYPE = "topic_type";
        this.TOPIC_BLOCK = "TOPIC_BLOCK";
        this.TYPE = "type";
        this.CALLING_TASK = "calling_task";
        this.GCF_CATEGORY = "conversational_analytics";
        this.INSTRUMENTATION_POINT = "virtual_agent";
        this.INSTRUMENTATION_EVENT = "virtual_agent_deflection";
    },

    /**
     *  VA Deflection Metrics 
     */
    insertVADeflection: function(event) {
        var metricInfo = new String(event.parm1);
        var activitiesInfo = new String(event.parm2);
        try {
            metricInfo = JSON.parse(metricInfo);
            if (metricInfo) {
                var metricId = this.insertMetric(metricInfo);
                if (metricId) {
                    activitiesInfo = JSON.parse(activitiesInfo);
                    this.insertActivities(metricId, activitiesInfo);
                }
            }
        } catch (e) {
            gs.log('[VA Deflection metrics]: Error while parsing event params: ' + e.message);
        }
    },

    /**
     * Insert VA Deflection Metric 
     */
    insertMetric: function(metricInfo) {
        var deflectionConfigSysId = metricInfo.config_id; // SSA_DEFLECTION_CONFIGURATION
        var deflectionPatternId = metricInfo.pattern_id; // SSA_DEFLECTION_PATTERN
        var conversationTaskId = this.getTaskIdOfCallerTopic(metricInfo.conversation_task_id); // Can coversation be empty??
        if (!deflectionConfigSysId || !deflectionPatternId || !conversationTaskId)
            return;
        var dfConfigGR = new GlideRecord(this.SSA_DEFLECTION_CONFIGURATION);
        if (!dfConfigGR.get(deflectionConfigSysId))
            return;
        var dfPatternGR = new GlideRecord(this.SSA_DEFLECTION_PATTERN);
        if (!dfPatternGR.get(deflectionPatternId))
            return;
        var dfMetricGr = new GlideRecord(this.SSA_DEFLECTION_METRIC);
        dfMetricGr.initialize();
        dfMetricGr.deflection_pattern = deflectionPatternId;
        dfMetricGr.content_table = this.SYS_CS_CONVERSATION_TASK;
        dfMetricGr.content_id = conversationTaskId || '';
        dfMetricGr.type = dfPatternGR.activity_pattern.outcome;
        dfMetricGr.setWorkflow(false);
        var dfMetricId = dfMetricGr.insert();
        if (!dfMetricId) {
            gs.log(
                "[VA Deflection metrics]: deflection metric insertion failed " +
                JSON.stringify(metricInfo)
            );
        }
        this.recordDeflectionUsageEvent(conversationTaskId, dfPatternGR.activity_pattern.outcome);
        return dfMetricId;
    },

    insertActivities: function(dfMetricId, activitiesInfo) {
        var activityTable = activitiesInfo.activity_table;
        if (!dfMetricId || !activityTable)
            return;
        var activityIds = activitiesInfo.activity_ids;
        if (activityIds) {
            var self = this;
            activityIds.split(',')
                .forEach(function(activityId) {
                    if (activityId) {
                        self.insertMetricActivity(dfMetricId, activityTable, activityId);
                    }
                });
        } else {
            // Allow creating metric activity even if activity id's are not available
            // Ex - use case - No incident created but we still wanted to group the metric count under the incident table
            this.insertMetricActivity(dfMetricId, activityTable);
        }
    },

    /**
     * Insert VA Deflection Metric Activity
     */
    insertMetricActivity: function(dfMetricId, activityTable, activityId) {
        var dfMetricActivityGr = new GlideRecord(this.SSA_DEFLECTION_METRIC_ACTIVITY);
        dfMetricActivityGr.initialize();
        dfMetricActivityGr.metric = dfMetricId;
        dfMetricActivityGr.activity_table = activityTable;
        if (activityId)
            dfMetricActivityGr.activity = activityId;
        dfMetricActivityGr.setWorkflow(false);
        dfMetricActivityGr.insert();
    },

    /**
     * If the deflection block's caller task is also a TOPIC_BLOCK, then search upward
     * for the actual TOPIC that caused deflection.
     */
    getTaskIdOfCallerTopic: function(currentTaskId) {
        var taskGr = new GlideRecord(this.SYS_CS_CONVERSATION_TASK);
        if (taskGr.get(currentTaskId)) {
            var topicId = taskGr.getValue(this.TOPIC_TYPE);
            if (topicId) {
                var topicGr = new GlideRecord(this.SYS_CS_TOPIC);
                if (topicGr.get(topicId)) {
                    var topicType = topicGr.getValue(this.TYPE);
                    if (topicType == this.TOPIC_BLOCK) {
                        return this.getTaskIdOfCallerTopic(taskGr.getValue(this.CALLING_TASK));
                    } else {
                        return currentTaskId;
                    }
                }
            }
        }
        return "";
    },

    /**
     * Collect data from the conversation task that caused deflection and publish
     * to GCF for analytics.
     */
    recordDeflectionUsageEvent: function(conversationTaskId, deflectionOutcome) {
        try {
            var conversationTaskGr = new GlideRecord(this.SYS_CS_CONVERSATION_TASK);
            if (conversationTaskGr.get(conversationTaskId)) {
                var sm = new GCFSampleMap();
                sm.put('device_type', conversationTaskGr.conversation.device_type);
                sm.put('deflection_type', deflectionOutcome);
                var csTopicGr = new GlideRecord(this.SYS_CS_TOPIC);
                if (csTopicGr.get(conversationTaskGr.getValue(this.TOPIC_TYPE))) {
                    sm.put('topic_name', csTopicGr.getValue('name'));
                    var cbTopicGr = new GlideRecord(this.SYS_CB_TOPIC);
                    if (cbTopicGr.get(csTopicGr.getValue('cb_topic_id'))) {
                        if (cbTopicGr.getValue('source_topic_id') == null && cbTopicGr.getValue('sys_policy') == 'read') {
                            sm.put('topic_origin', 'oob_topic');
                        } else {
                            sm.put('topic_origin', 'custom_topic');
                        }
                    }
                }
                GCFCollector.recordUsageEvent(this.GCF_CATEGORY, this.INSTRUMENTATION_POINT, this.INSTRUMENTATION_EVENT, sm);
            }
        } catch (err) {
            var message = "Failed to execute GCF collection for deflection metrics: " + err.message;
            gs.error(message);
        }
    },

    type: 'VADeflectionTracking'
};
