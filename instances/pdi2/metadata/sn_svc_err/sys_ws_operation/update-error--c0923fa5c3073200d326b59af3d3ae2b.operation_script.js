(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var displayMessage;
	var ERROR_STATUS_IN_DISCOVERY = 2;
	var ERROR_STATUS_PENDING_DISCOVERY = 5;
	var excludeInprogressLatestActionUpdate = false;

	var data = request.body.data;
	if (!request.pathParams.id) {
		displayMessage = gs.getMessage("Cannot process update because the error id is not present");
		return SvcErrRestHelper.createCustomizedServiceError({status: 400, message: displayMessage});
	}

	if(!data.app_id) {
		displayMessage = gs.getMessage("Cannot process update because the request does not contain the mandatory field app_id");
		return SvcErrRestHelper.createCustomizedServiceError({status: 400, message: displayMessage});
	}

	if((data.action == 'discover_all' || data.action == 'update_assign' || data.action == 'assign' || data.action == 'task') && !data.stats_sys_id) {
		displayMessage = gs.getMessage("Cannot process update because the request does not contain the mandatory field stats_sys_id");
		return SvcErrRestHelper.createCustomizedServiceError({status: 400, message: displayMessage});
	}

	data.action = data.action || "__$$$$___";

	try {
		switch(data.action) {
			case "unignore":
			case "ignore" :
				toggleIgnore(data);
				response.setStatus(200);
				return;
			case "discover":
				//data.status = "1";
				processSingle(data);
				break;
			case "discover_all":
				processBulk(data);
				break;
			case "stop":
				/* eslint-disable no-undef */
				new sn_svcerr.ErrorMgrScript(data.app_id).stopDiscovery(_getEncodedQuery(request.pathParams.id, data), data.stats_sys_id);
				/* eslint-enable no-undef */
				break;
			case "resolve_all": //unline discover all we do not want to store action history
				processBulk(data);
				break;
			case "assign":
			case "update_assign":
				/* eslint-disable no-undef */
				new sn_svcerr.ErrorMgrScript(data.app_id).assign(_getEncodedQuery(request.pathParams.id, data), data.stats_sys_id, data.comment);
				/* eslint-enable no-undef */
				if(data.action == "update_assign"){
					response.setStatus(200);
					return;
				}
				break;
			case "task":
				/* eslint-disable no-undef */
				new sn_svcerr.ErrorMgrScript(data.app_id).createTask(_getEncodedQuery(request.pathParams.id, data), data.stats_sys_id);
				/* eslint-enable no-undef */
				break;
			case "done_with_error":
				new sn_svcerr.ErrorMgrScript(data.app_id).doneWithError(_getEncodedQuery(request.pathParams.id, data));
				break;
			default:
		}
	} catch(err) {
		displayMessage = gs.getMessage("Cannot process suggestions because: {0}", [err]);
		return SvcErrRestHelper.createCustomizedServiceError({status: 400, message: displayMessage});
	}

	response.setStatus(200);
	response.setContentType("application/json");
	response.setBody(_getErrorStatusAndLatestAction());

	function _getErrorStatusAndLatestAction() {
		var errorGr = new GlideRecord("automation_error_msg");
		if(!errorGr.get(request.pathParams.id) || !errorGr.isValidRecord()) {
			var msg = gs.getMessage("Cannot get an error object because id is invalid");
			return SvcErrRestHelper.createCustomizedServiceError({status: 400, message: msg});
		}
		var latestAction = errorGr.latest_action ? errorGr.latest_action.is_global ? "global" : "selected" : null;
		return {status: errorGr.getDisplayValue('status')+'', latest_action: latestAction};
	}

	function processBulk(data) {
		var encodedQuery = data.encoded_query;
		if(!encodedQuery) {
			throw gs.getMessage("Cannot get an error objects because encode query is not present");
		}

		/* eslint-disable no-undef */
		new sn_svcerr.ErrorMgrScript(data.app_id).retryMultipleErrors(encodedQuery, data.stats_sys_id);
		/* eslint-enable no-undef */
	}

	function processSingle(data) {
		/* eslint-disable no-undef */
		new sn_svcerr.ErrorMgrScript(data.app_id).retrySingleError(request.pathParams.id);
		/* eslint-enable no-undef */
	}

	function toggleIgnore(data) {
		if (data.action == 'ignore') {
			/* eslint-disable no-undef */
			new sn_svcerr.ErrorMgrScript(data.app_id).ignoreError(request.pathParams.id);
			/* eslint-enable no-undef */
		} else {
			/* eslint-disable no-undef */
			new sn_svcerr.ErrorMgrScript(data.app_id).unIgnoreError(request.pathParams.id);
			/* eslint-enable no-undef */
		}
	}

	function _getEncodedQuery(errorId, data) {
		if(!data.encoded_query) {
			return 'sys_id='+errorId;
		}

		var encQuery = data.encoded_query;
		return encQuery;
	}

})(request, response);
