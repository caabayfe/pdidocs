(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {	
	var displayMessage;
	var actions = [];
	
	var errorCodeId = request.pathParams.id;
	var context = request.queryParams.context;
	var statsSysId = request.queryParams.stats_sys_id;
	var suggestions = [];
	if(context == "global") {
		suggestions = _getSuggestionsForErrorCodeBulkMode(errorCodeId, true, request.queryParams.app_id);
	} else if(context == "bulk") {	
		suggestions = _getSuggestionsForErrorCodeBulkMode(errorCodeId, false, request.queryParams.app_id);
	} else if(context == "all") {	
		suggestions = _getSuggestionsForErrorCodeBulkMode(errorCodeId, true, request.queryParams.app_id);
		var bulk = _getSuggestionsForErrorCodeBulkMode(errorCodeId, false, request.queryParams.app_id);
		for (var i = 0; i < bulk.length; i++) {
			suggestions.push(bulk[i]);
		}
	} else if(context == "map") {
		var isLeafEndpoint = String(request.queryParams.isLeafEndpoint) === "true";
		var canSkipAndResume = String(request.queryParams.canSkipAndResume) === "true";
		
		/* eslint-disable no-undef */
		suggestions = sn_svcerr.ErrorMgrScript.getSuggestionForMap(errorCodeId, isLeafEndpoint, canSkipAndResume);
		/* eslint-enable no-undef */
	}
	
	if(context != "map"){
		/* eslint-disable no-undef */
		var errCode = sn_svcerr.ErrorCode.getByStatsId(statsSysId);
		/* eslint-enable no-undef */
		//check whether the group has task or not based on the errorcodeid
		var groupHasTask = sn_svc_err.ErrorActionHelper.hasTaskForErrCode(statsSysId);
		//check if the status of the error code is ASSIGNED
		var isStatusAssigned = errCode.getStatus() == "ASSIGNED";
	}
	
	for (var j = 0; j < suggestions.length; j++) 
			actions.push(_getActionObj(suggestions[j]));
	
	function _getActionObj(/*ScopedSuggestion*/ suggestion) {
		var action = {
				id:           suggestion.getId(),
				icon_class:   suggestion.getIcon(),
				label:        suggestion.getLabel(),
				name:         suggestion.getName(),
				type:         suggestion.getType(),
				category:     "global",
				payload:      getPayload(suggestion)
		};
		
		if (!suggestion.isGlobal()) {
			action.category = "error_code";
		}
		
		action.errorCode = {
			id:   suggestion.getErrorCode().getId(),
			name: suggestion.getErrorCode().getName(),
			description: suggestion.getErrorCode().getDescription(),
			priority: suggestion.getErrorCode().getPriority()
		};

		action.disabled = getActionDisabledValue(action);
		return action;
	}
	
	function getActionDisabledValue(action){
		var disabled = false;
		
		// Disable actions 'OpenTask in SN' and 'Mark as Assigned' if group has a task
		// or disable action 'Mark as Assigned' if error status is assigned
		if(groupHasTask && (action.id == ErrorMgmtConstants.OPEN_TASK_IN_SN_ID /*OpenTask in SN*/)){
		   disabled = true;
		} else if (isStatusAssigned && (action.id == ErrorMgmtConstants.MARK_AS_ASSIGNED_ID /*Mark as assigned*/)){
			disabled = true;
		}
		return disabled;
	}
	
	function getPayload(suggestion) {
		if (suggestion.getType() == "Message") {
			return suggestion.getMessage();
		}
		
		return new global.JSON().decode(suggestion.getContent());
	}
	
	function _getSuggestionsForErrorCodeBulkMode(errorCode, selectedErrorSuggestions, applicationId) {
		/* eslint-disable no-undef */
		var errCodeSuggestions = new sn_svcerr.ErrorMgrScript(applicationId).getSuggestionsForBulk(errorCode, selectedErrorSuggestions);
		/* eslint-enable no-undef */
		
		return errCodeSuggestions;
	}
	
	response.setStatus(200);
	response.setContentType('application/json');
	response.setBody(actions);

})(request, response);
