var PADGCFCollector = Class.create();
PADGCFCollector.prototype = {
    initialize: function() {
		this.GCF_CATEGORY = 'process_automation_usage';
		this.GCF_POINT = 'snc.usage.process_automation';
	},
    processEvents: {
        PROCESS_CREATED: 'process_created',
		PLACEHOLDER_ACTIVITY_PICKED: 'placeholder_activity_picked',
		VARIANT_CREATED: 'variant_created',
		OVERRIDE_CREATED: 'override_created',
		VARIANT_ACTIVITY_CREATED: 'variant_activity_created',
		FAVORITE_VARIANT: 'favorite_variant',
		VARIANT_EVALUATION_POINT_SET: 'variant_evaluation_point_set',
		DECISION_STAGE_ADDED: 'decision_stage_added'
    },
    validateProcessEvent: function(processEvent) {
        for (var key in this.processEvents) {
            if (this.processEvents[key] === processEvent)
                return true;
        }
        return false;
    },
    recordProcessUsageEvent: function(processEvent, processValue) {
        if (this.validateProcessEvent(processEvent)) {
            var sm = new GCFSampleMap();
            sm.put('process_key', processValue);
            GCFCollector.recordUsageEvent(this.GCF_CATEGORY, this.GCF_POINT, processEvent, sm);
        }
    },
	recordProcessUsageEventWithMap: function(processEvent, gcfSampleMap) {
        if (this.validateProcessEvent(processEvent)) {
            GCFCollector.recordUsageEvent(this.GCF_CATEGORY, this.GCF_POINT, processEvent, gcfSampleMap);
        }
    },
    type: 'PADGCFCollector'
};
