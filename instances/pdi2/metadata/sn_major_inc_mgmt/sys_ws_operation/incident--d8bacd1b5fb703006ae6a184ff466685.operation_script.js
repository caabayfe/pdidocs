(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var incidentSysId = request.pathParams.incidentSysId;
	if (!incidentSysId)
		return new sn_ws_err.BadRequestError("Incident id not provided");

	var taskDetails = new global.MIMWorkbenchUtil().getTaskDetails('incident', incidentSysId);
	if (taskDetails) {
		var resp = {};
		var workbenchUtils = new global.MIMWorkbenchUtil();
		resp.incident = taskDetails.taskJs;
		resp.states = workbenchUtils.getIncidentStates(taskDetails.taskGr);
		resp.uiActions = {
			'resolve': {
				'allowed': workbenchUtils.evaluateUiAction(taskDetails.taskGr, 'resolve_incident')
			},
			'promote': {
				'allowed': workbenchUtils.evaluateUiAction(taskDetails.taskGr, 'sysverb_mim_accept')
			},
			'reject': {
				'allowed': workbenchUtils.evaluateUiAction(taskDetails.taskGr, 'sysverb_mim_reject')
			},
			'create_new_mi': {
				'allowed': workbenchUtils.evaluateUiAction(taskDetails.taskGr, 'sysverb_mim_create_new_mi')
			},
			'close': {
				'allowed': workbenchUtils.evaluateUiAction(taskDetails.taskGr, 'close_incident')
			},
			'generate_timeline': {
				'allowed': workbenchUtils.evaluateUiAction(taskDetails.taskGr, 'incident_generate_pir_timeline')
			},
			'preview_pir': {
				'allowed': workbenchUtils.evaluateUiAction(taskDetails.taskGr, 'incident_preview_pir')
			},
			'edit_overview': {
				'allowed': taskDetails.taskGr.getElement('overview').canWrite()
			},
			'edit_lessons_learned': {
				'allowed': taskDetails.taskGr.getElement('lessons_learned').canWrite()
			},
			'edit_timeline': {
				'allowed': taskDetails.taskGr.getElement('timeline').canWrite()
			}
		};
		resp.canChangeState = workbenchUtils.canChangeState();
		resp.closeCodes = workbenchUtils.getCloseCodes(taskDetails.taskGr);
		resp.incidentTasks = workbenchUtils.getRelatedIncidentTasks(incidentSysId);
		return resp;
	}

	return new sn_ws_err.NotFoundError("Requested Incident not found");

})(request, response);
