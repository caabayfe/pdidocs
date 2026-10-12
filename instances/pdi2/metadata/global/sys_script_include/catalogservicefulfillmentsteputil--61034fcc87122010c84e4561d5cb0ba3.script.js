var CatalogServiceFulfillmentStepUtil = Class.create();
CatalogServiceFulfillmentStepUtil.prototype = {

    initialize: function() {

    },

    parseJson: function(value) {
        var jsonObj;
        try {
            if (typeof value === 'string')
                jsonObj = JSON.parse(value);
            else if (typeof value === 'object')
                jsonObj = value;
        } catch (e) {
            gs.log(e);
        }

        if (!jsonObj || !jsonObj.hasOwnProperty('sys_class_name'))
            return null;

        var gr = new GlideRecord(jsonObj['sys_class_name']);
        gr.initialize();

        var list = gr.getElements();
        for (var i = 0; i < list.size(); i++) {
            var ele = list.get(i);
            if (jsonObj.hasOwnProperty(ele.getName()))
                gr.setValue(ele.getName(), jsonObj[ele.getName()]);

        }
        gr.makeReadonly();
        return gr;
    },

    buildJson: function(gr) {
        var jsonObj = {};
        if (!gr || !gr.instanceOf('sc_service_fulfillment_step'))
            return jsonObj;

        var list = gr.getElements();

        for (var i = 0; i < list.size(); i++)
            jsonObj[list.get(i).getName()] = gr.getValue(list.get(i).getName());

        return jsonObj;
    },

    createStep: function(request) {
        return this.populateStepPayloadAndSubmit(request, 'execute_producer');
    },

    updateStep: function(request) {
        return this.populateStepPayloadAndSubmit(request, 'save_producer');
    },

    populateStepPayloadAndSubmit: function(request, producerAction) {
        var requestBody = request.body.nextEntry();

        if (!requestBody.variables)
            throw new sn_ws_err.BadRequestError("Variables field is missing in request payload");

        var recordProducerId = requestBody.producer_id;

        if (!GlideStringUtil.isEligibleSysID(recordProducerId))
            throw new sn_ws_err.BadRequestError("Record producer id is not valid.");

        var catalogItem = new sn_sc.CatItem(recordProducerId);

        if (!catalogItem.canView())
            throw new sn_ws_err.BadRequestError("Security Constraints prevent access to the item");

        if (!requestBody.variables.service_fulfillment_step_configuration)
            throw new sn_ws_err.BadRequestError("Service fulfillment step configuration is missing in variables");

        var action = requestBody.variables.service_fulfillment_step_configuration;

        for (var key in requestBody.variables)
            if (requestBody.variables.hasOwnProperty(key) && requestBody.variables[key] != null && typeof(requestBody.variables[key]) !== 'string')
                requestBody.variables[key] = requestBody.variables[key].toString();

        requestBody.sysparm_id = recordProducerId;
        requestBody.sysparm_action = producerAction;

        if (!requestBody.sysparm_item_guid)
            requestBody.sysparm_item_guid = gs.generateGUID('');

        var stepInfo = {};
        var responseBody = this.submitStepRecordProducer(requestBody);

        if (!responseBody.errMsg && responseBody.result) {
            stepInfo.stage_id = responseBody.stage_id;
            stepInfo.step_id = responseBody.result.sys_id;
            stepInfo.action_id = action;
			stepInfo.step_label = responseBody.result.step_label;
            stepInfo.producer_id = recordProducerId;
        }

        return {
            "step_info": stepInfo,
            "response_body": responseBody
        };
    },

    submitStepRecordProducer: function(requestBody) {
        var responseBody = {};
        try {
            responseBody = sn_sc.ServiceFulfillment.submitStepRecordProducer(requestBody);
        } catch (e) {
            gs.debug(e);
            var catalogExceptionUtils = new global.CatalogExceptionUtils();
            if (catalogExceptionUtils.isValveException(e))
                responseBody = catalogExceptionUtils.handleValveExceptionInPortal(e);
            else
                throw sn_ws_err.ServiceError("Invalid request");
        }

        return responseBody;
    },
	
	//Evaluates the Calculated Title for a given Service fulfillment step
	getStepTitle: function(current) {
		//Get the actual Service Fulfillment Step Record by Instance.
		if (!current.service_fulfillment_step_configuration)
			return '';
		
		var actionTitle = current.service_fulfillment_step_configuration.dynamic_title.getDisplayValue();
		var actionName  = current.service_fulfillment_step_configuration.name.getDisplayValue();
		var length = 200;
		if (GlideStringUtil.nil(actionTitle))
			return this.truncateValue(actionName, length);
		
		var stepFields = actionTitle.match(/\$\{\w+(?=\})/g) || [];
		if (stepFields.length === 0)
			return this.truncateValue(actionTitle, length);
				
		var actualRecord = current;
		var recordClassName = current.getRecordClassName();
		var currentTableName = current.getTableName();
		if (recordClassName !== currentTableName) {
			actualRecord = new GlideRecord(recordClassName);
			actualRecord.get(current.getUniqueValue());
		}
		
		var props = {};
		for (var field in stepFields) {
			var fieldName = stepFields[field].substring(2);
			if (!GlideStringUtil.nil(fieldName) && !GlideStringUtil.nil(actualRecord.getDisplayValue(fieldName)))
				props[fieldName] = actualRecord.getDisplayValue(fieldName);
		}
		
		var dynamicTitle = GlideappScriptHelper.substituteVariables(actionTitle, props) + '';
		if (GlideStringUtil.nil(dynamicTitle))
			dynamicTitle = actionName;
		return this.truncateValue(dynamicTitle, length);
	},
	
	getApprovalTitle: function(current) {
		var actualRecord = current;
		if (current.getTableName() !== 'sc_service_fulfillment_approval_step') {
			actualRecord = new GlideRecord('sc_service_fulfillment_approval_step');
			actualRecord.get(current.getUniqueValue());
		}
		
		var users = GlideStringUtil.nil(actualRecord.getValue("users")) ? [] : GlideappScriptHelper.getDisplayValues(actualRecord, "users");
		var groups = GlideStringUtil.nil(actualRecord.getValue("groups")) ? [] : GlideappScriptHelper.getDisplayValues(actualRecord, "groups");
		var totalAssignes = users.length + groups.length;
		var viewRecords = [];
	
		for (var userIdx = 0 ; userIdx < users.length && viewRecords.length < 2; userIdx++)
			viewRecords.push(users[userIdx]);
	
		for (var groupIdx = 0 ; groupIdx < groups.length && viewRecords.length < 2; groupIdx++)
			viewRecords.push(groups[groupIdx]);
	
		if (totalAssignes === 1)
			return viewRecords[0];
		else if (totalAssignes === 2)
			return gs.getMessage("{0} and {1}", [viewRecords[0], viewRecords[1]]);
		else if (totalAssignes > 2) 
			return gs.getMessage("{0}, {1} +{2} others", [viewRecords[0], viewRecords[1], (totalAssignes - 2).toString()]);
		else 
			return '';
	},
	
	truncateValue : function(value, length) {
		var ending = "...";
		if (value.length > length)
			value = value.substring(0, length - ending.length) + ending;
		return value;
	},

    type: 'CatalogServiceFulfillmentStepUtil'
};
