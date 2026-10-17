var LabelCacheCleanupAction = Class.create();
LabelCacheCleanupAction.prototype = {
    initialize: function() {
    },

    type: 'LabelCacheCleanupAction'
};

LabelCacheCleanupAction.getCleanActionLabelCache = function(text, printDetails) {
	var result = null;
	try {
		var action = JSON.parse(text);
		var sysId = action.sys_id || action.id;
		var name = action.name;
		var labelCache = action.label_cache;
		result = LabelCacheCleanupAction.getCleanFlowLabelCache(sysId, name, labelCache, printDetails);

	} catch (e) {
		gs.error (e);
	}
	return result;
}; 

LabelCacheCleanupAction.getCleanActionLabelCache = function(sysId, name, labelCache, printDetails) {
	var result = null;
    var hitCount = 0;
	var missCount = 0;
	try {
		LabelCacheCleanupAction.printWithName(name, "Attempting to clean the label cache for action \'" + name + "\' with sys id \'" + sysId);
		if (!labelCache) {
			LabelCacheCleanupAction.printWithName(name, "Has an empty label cache");
		} else {
			var pills = LabelCacheCleanupAction.getActionPills(sysId);
			var parsedLabelCache = JSON.parse(labelCache);
			result = labelCache;
			LabelCacheCleanupAction.printWithName(name, "Original label cache before the removal:\n" + name + ": " + labelCache);
			var newLabelCache = [];
			for (var labelKey in parsedLabelCache) {
				if (pills[parsedLabelCache[labelKey].name] || pills['{{' + parsedLabelCache[labelKey].name + '}}'] ||
					pills[parsedLabelCache[labelKey].fName] || pills['{{' + parsedLabelCache[labelKey].fName + '}}']) {
					if (printDetails)
						LabelCacheCleanupAction.printWithName(name, "We have a match" + parsedLabelCache[labelKey].name);
					newLabelCache.push(parsedLabelCache[labelKey]);
					hitCount++;
				} else {
					if (printDetails)
						LabelCacheCleanupAction.printWithName(name, "We have a miss " + parsedLabelCache[labelKey].name);
					missCount++;
					actionModified = true;
				}
			}
			result = JSON.stringify(newLabelCache);

			if (printDetails) {
				LabelCacheCleanupAction.printWithName(name, "hitCount: " + hitCount + " missCount: " + missCount);
				LabelCacheCleanupAction.printWithName(name, "New label cache after the removal:\n" + name + ": " + labelCache);
			}
		}
	} catch (e) {
		gs.error (e);
	}

    return result;
};

LabelCacheCleanupAction.isEmpty = function(obj) {
    return !obj || (Object.keys(obj).length === 0 && obj.constructor === Object);
};

LabelCacheCleanupAction.getActionPills = function(actionId) {
    var pills = {};
    var steps = new GlideRecord("sys_hub_step_instance");
    steps.addQuery("action",actionId);
    steps.query();
    while(steps.next()) {
        var stepSysId = steps.sys_id || steps.id;
        LabelCacheCleanupAction.findPillsInMapping(stepSysId, pills);
        LabelCacheCleanupAction.findPillsInVariableValue(stepSysId, pills);
    }

    LabelCacheCleanupAction.findPillsInMapping(actionId, pills);
    LabelCacheCleanupAction.findPillsInErrorHandling(actionId, pills); 
    return pills;
};

LabelCacheCleanupAction.findPillsInMapping = function(id, pills) {
    var elementMapping = new GlideRecord("sys_element_mapping");
    elementMapping.addQuery("id", id);
    elementMapping.query();
    while(elementMapping.next()) { 
        var value = elementMapping.value;
        LabelCacheCleanupAction.findPillsInValue(value, pills);
    }
};

LabelCacheCleanupAction.findPillsInVariableValue = function(id, pills) {
    var variableValue = new GlideRecord("sys_variable_value");
    variableValue.addQuery("document_key", id);
    variableValue.query();
    while(variableValue.next()) {
        var value = variableValue.value;
        LabelCacheCleanupFlow.findPillsInValue(value, pills);
    }
};


LabelCacheCleanupAction.findPillsInTransform = function(value, pills) {
    // removes "{{fd_transform:" prefix and "}}" postfix
    if (value && value.length > 16) {
        var uuid = value.substring(15, value.length - 2);
        var pillCompound = new GlideRecord("sys_hub_pill_compound");
        pillCompound.addQuery("ui_id", uuid);
        pillCompound.query();
        while (pillCompound.next()) {
            var prescription = pillCompound.prescription;
            LabelCacheCleanupAction.findPillsInValue(prescription, pills);
        }
    }
};

LabelCacheCleanupAction.findPillsInValue = function(value, pills) {
    var result;
	var PILL_REGEX = /{{(?!{)([^}]*)}}/g;
    while(result = PILL_REGEX.exec(value)) {
        if (result[0] && result[0].startsWith("{{fd_transform:") && result[0].length > 16) {
            LabelCacheCleanupAction.findPillsInTransform(result[0], pills);
        } else {
            pills[result[0]] = true;
        } 
    }
};

LabelCacheCleanupAction.findPillsInErrorHandling = function(id, pills) {
    var errorHandlingMetadata = new GlideRecord("sys_hub_action_status_metadata");
    if (!errorHandlingMetadata.get("action_type_id", id))
        return;

    var statusCondition = new GlideRecord("sys_hub_status_condition");
    var errorHandlingMetadataSysId = errorHandlingMetadata.sys_id || errorHandlingMetadata.id;
    statusCondition.addQuery("action_status_metadata_id", errorHandlingMetadataSysId);
    statusCondition.query();
    while (statusCondition.next()) {
        LabelCacheCleanupAction.findPillsInValue(statusCondition.status, pills);
        LabelCacheCleanupAction.findPillsInValue(statusCondition.condition, pills);
    }
};

LabelCacheCleanupAction.printWithName = function(name, text) {
    gs.info(name + ": " + text);
};
