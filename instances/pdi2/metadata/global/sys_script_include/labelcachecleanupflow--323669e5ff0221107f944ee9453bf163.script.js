var LabelCacheCleanupFlow = Class.create();
LabelCacheCleanupFlow.prototype = {
    initialize: function() {
    },

    type: 'LabelCacheCleanupFlow'
};

LabelCacheCleanupFlow.getCleanFlowLabelCacheWithFlow = function(flowText, printDetails) {
	var result = null;
	try {
		flow = JSON.parse(flowText);
		var sysId = flow.sys_id || flow.id;
		var name = flow.name;
		var labelCache = flow.label_cache;
		result = LabelCacheCleanupFlow.getCleanFlowLabelCache(sysId, name, labelCache, printDetails);

	} catch (e) {
		gs.error (e);
	}
	return result;
}; 

LabelCacheCleanupFlow.getCleanFlowLabelCache = function(sysId, name, labelCache, printDetails) {
    var result = null;
	var hitCount = 0;
	var missCount = 0;
	try {
		LabelCacheCleanupFlow.printWithName(name, "Attempting to clean the label cache for flow/subflow \'" + name + "\' with sys id \'" + sysId);
		if (!labelCache) {
			LabelCacheCleanupFlow.printWithName(name, "Has an empty label cache");
		} else {
			
			var parsedLabelCache = JSON.parse(labelCache);
			var pills = LabelCacheCleanupFlow.getPills(sysId);

			result = labelCache;
			LabelCacheCleanupFlow.printWithName(name, "Original label cache before the removal:\n" + name + ": " + labelCache);
			var newLabelCache = [];
			for (var labelKey in parsedLabelCache) {
				if (pills[parsedLabelCache[labelKey].name] || pills['{{' + parsedLabelCache[labelKey].name + '}}'] ) {
					if (printDetails)
						LabelCacheCleanupFlow.printWithName(name, "We have a match " + parsedLabelCache[labelKey].name);
					newLabelCache.push(parsedLabelCache[labelKey]);
					hitCount++;
				} else {
					if (printDetails)
						LabelCacheCleanupFlow.printWithName(name, "We have a miss " + parsedLabelCache[labelKey].name);
					missCount++;
				}
			}
			result = JSON.stringify(newLabelCache);
			if (printDetails) {
				LabelCacheCleanupFlow.printWithName(name, "hitCount: " + hitCount + " missCount: " + missCount);
				LabelCacheCleanupFlow.printWithName(name, "New label cache after the removal:\n" + name + ": " + labelCache);
			}
		}
	} catch (e) {
		gs.error (e);
	}

    return result;
};

LabelCacheCleanupFlow.getPills = function(flowId) {
    var pills = {};
    var instances = new GlideRecord("sys_hub_flow_component");
    instances.addQuery("flow", flowId);
    instances.query();
    while(instances.next()) {
		var instanceSysId = instances.sys_id || instances.id;
        LabelCacheCleanupFlow.findPillsInMapping(instanceSysId, pills);
        LabelCacheCleanupFlow.findPillsInVariableValue(instanceSysId, pills);
    }

    LabelCacheCleanupFlow.findPillsInMapping(flowId, pills);
    LabelCacheCleanupFlow.findPillsInVariableValue(flowId, pills);
    LabelCacheCleanupFlow.findPillsInTriggerInstance(flowId, pills);
    return pills;
};

LabelCacheCleanupFlow.findPillsInTriggerInstance = function(flowId, pills) {
    var triggerInstance = new GlideRecord("sys_hub_trigger_instance");
    triggerInstance.addQuery("flow", flowId);
    triggerInstance.query();
    // should be at max one result in triggerInstance
    while(triggerInstance.next()) { 
        var triggerInstanceId = triggerInstance.sys_id || triggerInstance.id;
        var sysVariableValue = new GlideRecord("sys_variable_value");
        sysVariableValue.addQuery("document_key", triggerInstanceId);
        sysVariableValue.query();
        while(sysVariableValue.next()) {
            var value = sysVariableValue.value;
            LabelCacheCleanupFlow.findPillsInValue(value, pills);
        }
    }
};


LabelCacheCleanupFlow.findPillsInMapping = function(id, pills) {
    var elementMapping = new GlideRecord("sys_element_mapping");
    elementMapping.addQuery("id", id);
    elementMapping.query();
    while(elementMapping.next()) { 
        var value = elementMapping.value;
        LabelCacheCleanupFlow.findPillsInValue(value, pills);
    }
};

LabelCacheCleanupFlow.findPillsInVariableValue = function(id, pills) {
    var variableValue = new GlideRecord("sys_variable_value");
    variableValue.addQuery("document_key", id);
    variableValue.query();
    while(variableValue.next()) {
        var value = variableValue.value;
        LabelCacheCleanupFlow.findPillsInValue(value, pills);
    }
};

LabelCacheCleanupFlow.findPillsInTransform  = function(value, pills) {
    // removes "{{fd_transform:" prefix and "}}" postfix
    if (value && value.length > 16) {
        var uuid = value.substring(15, value.length - 2);
        var pillCompound = new GlideRecord("sys_hub_pill_compound");
        pillCompound.addQuery("ui_id", uuid);
        pillCompound.query();
        while (pillCompound.next()) {
            var prescription = pillCompound.prescription;
            LabelCacheCleanupFlow.findPillsInValue(prescription, pills);
        }
    }
};

LabelCacheCleanupFlow.findPillsInValue = function(value, pills) {
    var result;
	var PILL_REGEX = /{{(?!{)([^}]*)}}/g;
    while(result = PILL_REGEX.exec(value)) {
        if (result[0] && result[0].startsWith("{{fd_transform:") && result[0].length > 16) {
            LabelCacheCleanupFlow.findPillsInTransform(result[0], pills);
        } else {
            pills[result[0]] = true;
        } 
    }
};

LabelCacheCleanupFlow.findPillsInErrorHandling = function(id, pills) {
    var errorHandlingMetadata = new GlideRecord("sys_hub_action_status_metadata");
    if (!errorHandlingMetadata.get("action_type_id", id))
        return;

    var statusCondition = new GlideRecord("sys_hub_status_condition");
	var errorHandlingMetadataSysId = errorHandlingMetadata.sys_id || errorHandlingMetadata.id;
    statusCondition.addQuery("action_status_metadata_id", errorHandlingMetadataSysId);
    statusCondition.query();
    while (statusCondition.next()) {
        LabelCacheCleanupFlow.findPillsInValue(statusCondition.status, pills);
        LabelCacheCleanupFlow.findPillsInValue(statusCondition.condition, pills);
    }
};

LabelCacheCleanupFlow.printWithName = function(name, text) {
    gs.print(name + ": " + text);
};
