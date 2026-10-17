var DeploymentRequestPayloadValidator = Class.create();
DeploymentRequestPayloadValidator.prototype = {
    initialize: function() {},

    type: 'DeploymentRequestPayloadValidator',

    validate: function(payload) {
        var result = {
            is_valid: true,
            error_message: ''
        };
        if (!payload) {
            result.is_valid = false;
            result.error_message = gs.getMessage('The payload is missing.');
            return result;
        }

        if (typeof payload === "string") {
            try {
                payload = JSON.parse(payload);
            } catch (e) {
                result.is_valid = false;
                result.error_message = gs.getMessage('Error parsing the payload');
                return;
            }
        }
        var requiredFields = DeploymentPipelineConstants.deploymentRequest.payloadFields.required;
        var missingFields = [];
        //Excluding these fields because if one is present then the other is not required
        var excluded = [requiredFields.REQUESTOR_SYS_ID, requiredFields.REQUESTOR_USER_NAME];
        for (var key in requiredFields) {
            var field = requiredFields[key];
            if (!payload[field] && excluded.indexOf(field) === -1) {
                missingFields.push(field);
            }
        }
        if (!payload[requiredFields.REQUESTOR_SYS_ID] && !payload[requiredFields.REQUESTOR_USER_NAME]) {
            result.is_valid = false;
            result.error_message += gs.getMessage('Either {0} or {1} is required.', [requiredFields.REQUESTOR_SYS_ID, requiredFields.REQUESTOR_USER_NAME]);
        }
        if (missingFields.length > 0) {
            result.is_valid = false;
            result.error_message += gs.getMessage('The following are required fields - {0}.', [missingFields.join(', ')]);
        }
		
		var appSysId = payload[requiredFields.APP_SYS_ID];
		var deploymentRequestUtils = new DeploymentRequestUtils(); 
		
		if(appSysId && deploymentRequestUtils.isOpenDeploymentRequestPresentForApp(appSysId)) {
			result.is_valid = false;
			result.error_message += gs.getMessage('Application with sys_id {0} has an open deployment request.', appSysId);
		}

        return result;
    }
};
