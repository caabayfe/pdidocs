(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var request_body = request.body.nextEntry();

    var mode = request.queryParams.mode ? request.queryParams.mode + '' : undefined;
    var templateId = request.queryParams.template_id ? request.queryParams.template_id + '' : undefined;
	var parentRecordTable = request_body.sysparm_parent_target_record_table ? request_body.sysparm_parent_target_record_table.toString() : undefined;
	var parentRecordId = request_body.sysparm_parent_target_record_id ? request_body.sysparm_parent_target_record_id.toString() : undefined;
    for (var key in request_body.variables)
        if (request_body.variables.hasOwnProperty(key) && request_body.variables[key] != null && typeof(request_body.variables[key]) !== 'string')
            request_body.variables[key] = request_body.variables[key].toString();

    var requestObj = {
        wizardId: request.pathParams.sys_id + '',
        targetRecord: request.pathParams.record_id + '',
        mode: mode,
        templateId: templateId,
        variables: request_body.variables,
		parentTargetRecordTable: parentRecordTable,
		parentTargetRecordId: parentRecordId,
    };

    if (requestObj.mode == 'template') {
        var templateParams = ['sysparm_template_type', 'sysparm_template_name', 'sysparm_template_shortDescription', 'sysparm_template_availableFor', 'sysparm_template_readonly', 'sysparm_template_mandatory', 'sysparm_template_restricted', 'sysparm_changedQuestions', 'sysparm_template_use_template_scope'];

        for (var i in templateParams) {
            var templateParam = templateParams[i];
            if (request_body.hasOwnProperty(templateParam) && request_body[templateParam] != null)
                requestObj[templateParam] = request_body[templateParam].toString();

        }
    }

	var responseObject;
	try {
		var answerObject = sn_sc.CatalogWizardHandler.submit(requestObj);
		responseObject = JSON.parse(answerObject);
	} catch (e) {
		gs.debug(e);
		responseObject = {
			errMsg: e.getMessage() + ''
		};
	}

    return responseObject;
})(request, response);
