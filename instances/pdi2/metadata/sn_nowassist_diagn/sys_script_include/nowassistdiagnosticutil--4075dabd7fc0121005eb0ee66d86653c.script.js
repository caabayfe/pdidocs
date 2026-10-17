var NowAssistDiagnosticUtil = Class.create();
NowAssistDiagnosticUtil.prototype = {
	initialize: function() {
	},

	type: 'NowAssistDiagnosticUtil'
};

NowAssistDiagnosticUtil.validateCapabilitySettings = function(capabilityName, sourcePluginName) {
	var messages = [];

	var oneExtendCapabilityGr = new GlideRecord("sys_one_extend_capability");
	oneExtendCapabilityGr.addQuery("name", capabilityName);
	try {
		oneExtendCapabilityGr.query();
	} catch (e) {
		messages.push(new DiagnosticMessage("Error querying sys_one_extend_capability", "Glide OneExtend plugin may not be installed, or may need to be repaired"));
		return messages;
	}
	if (oneExtendCapabilityGr.next()) {
		var definitionConfigGr = new GlideRecord("sys_one_extend_definition_config");
		definitionConfigGr.addQuery("capability", oneExtendCapabilityGr.sys_id);
		try {
			definitionConfigGr.query();
		} catch (e) {
			messages.push(new DiagnosticMessage("Error querying sys_one_extend_definition_config", "Glide OneExtend plugin may not be installed, or may need to be repaired"));
			return messages;
		}
		var found = false;
		while(definitionConfigGr.next() && !found) {
			found = definitionConfigGr.getValue("default") === "1";
		}
		if (!found) {
			messages.push(new DiagnosticMessage("No default definition", "Set one of the definitions in the " + capabilityName + " capability as \"default\""));
		} else {
			var generativeAiConfigGr = new GlideRecord("sys_generative_ai_config");
			generativeAiConfigGr.addQuery("definition", definitionConfigGr.definition);
			generativeAiConfigGr.addQuery("definition_table", "sys_one_extend_capability_definition");
			try {
				generativeAiConfigGr.query();
			} catch (e) {
				messages.push("Error querying sys_generative_ai_config", "Generative AI Controller plugin may not be installed, or may need to be repaired");
			}
			if (!generativeAiConfigGr.next()) {
				messages.push(new DiagnosticMessage("Generative AI Config " + capabilityName + " capability missing ", "Reinstall the " + sourcePluginName + " application"));
			}
		}
	} else {
		messages.push(new DiagnosticMessage(capabilityName + " capability missing", "Reinstall the " + sourcePluginName + " application"));
	}
	return messages;
};

NowAssistDiagnosticUtil.testRequestExecution = function(testPayload, capabilityId, capabilityName, additionalVerificationFn, configFilters) {
	var messages = [];

	var request = { 
		"executionRequests": [{ 
			"payload": testPayload, 
			"capabilityId": capabilityId,
			"meta": configFilters ? { configFilters } : {}
		}]
	}; 

	var response = sn_one_extend.OneExtendUtil.execute(request); 

	var capabilityResponse = response.capabilities[capabilityId];
	if (!capabilityResponse) {
		messages.push(new DiagnosticMessage("Unexpected problem executing capability " + capabilityName + ": " + JSON.stringify(response), "Check the response and logs for details"));
	} else if (capabilityResponse.status === "error") {
		var remedyMessage = "Please check the response details";
		if (capabilityResponse.errorCode == 401) {
			remedyMessage = "Please verify your credentials";
		} else if (capabilityResponse.errorCode == 500) {
			remedyMessage = "Check status of remote service";
		}
		messages.push(new DiagnosticMessage("Error in executing capability " + capabilityName + ": "  + capabilityResponse.error, remedyMessage));
	} else {
		if (typeof additionalVerificationFn == 'function') {
			messages = messages.concat(additionalVerificationFn(capabilityResponse));
		}
	}

	return messages;
};
