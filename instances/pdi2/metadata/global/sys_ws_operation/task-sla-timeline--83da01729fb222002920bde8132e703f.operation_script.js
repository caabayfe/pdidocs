(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	function getParamVal (p, params, defaultValue) {
		if (typeof defaultValue == 'undefined')
			defaultValue = null;
		if (!params)
			return defaultValue;
		var val = params[p];
		if (!val || val.length === 0)
			return defaultValue;
		return val[0];
	}

	var params = request.queryParams;
	var getTaskSlaGroupedBySla = getParamVal('get_task_slas_grouped_by_sla', params, 'false') == 'true';
	var getDBTaskSlasAsStored = getParamVal('get_db_task_slas_as_stored', params, 'false') == 'true';
	var getTaskFullDetails = getParamVal('get_task_full_details', params, 'false') == 'true';
	var getAllStages = getParamVal('get_all_stages', params, 'false') == 'true';
	var configParams = {
		getTaskSlaGroupedBySla: getTaskSlaGroupedBySla,
		getDBTaskSlasAsStored: getDBTaskSlasAsStored,
		getTaskFullDetails: getTaskFullDetails,
		getAllStages: getAllStages
	};

	var contractSLAIds = getParamVal('contract_sla_ids', params, '').split(',');

    var resp = new SLATimeLineV2(configParams).getTimeLineDetails(request.pathParams.taskId, contractSLAIds);
	if (resp.apiError)
		return new sn_ws_err.BadRequestError(resp.apiError);
	else if (resp.apiSecurityError) {
		var respError = new sn_ws_err.ServiceError();
		respError.setStatus(403);
		respError.setMessage(resp.apiSecurityError);
		return respError;
	}
	else
		return resp;

})(request, response);
