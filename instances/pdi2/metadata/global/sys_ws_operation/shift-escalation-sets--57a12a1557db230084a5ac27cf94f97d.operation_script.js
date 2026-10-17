(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var rotaId = request.queryParams.rota_id;
	var taskTable = request.queryParams.task_table;
	var taskSysId = request.queryParams.task_sys_id;
	
	if (!rotaId)
		return new sn_ws_err.BadRequestError("Rota id is not provided");

	var canReadCalendar = new OCCalendarUtils().canRead();
	if (canReadCalendar) {
		if (typeof rotaId == "object")
			rotaId = rotaId[0];
		if (typeof taskTable == "object")
			taskTable = taskTable[0];
		if (typeof taskSysId == "object")
			taskSysId = taskSysId[0];

		var escalationSets = new OCEscalationDesigner().getRotaEscalationSets(rotaId);

		var conditionMatchedEscSetGr;
		var taskGr;
		if (taskTable && taskSysId) {
			if (!GlideDBObjectManager.get().isInstanceOf(taskTable, 'task')) {
				var configRecord = new TriggerRuleTableConfigUtilSNC().getTriggerRuleTableConfigRecord(taskTable);
				if (!configRecord || !configRecord.isValidRecord()) {
					return new sn_ws_err.BadRequestError("Table must extend task table or be configured in trigger rule table config");
				}
			}
			taskGr = new GlideRecordSecure(taskTable);
			if (!taskGr.get(taskSysId)) {
				return new sn_ws_err.NotFoundError("Task record not found or access denied");
			}
		}
		conditionMatchedEscSetGr = new OnCallRotation().getRotaEscalationSet(rotaId, taskGr);
		if (conditionMatchedEscSetGr) {
			for (var i = 0; i < escalationSets.length; i++) {
				var escalationSet = escalationSets[i];
				if (escalationSet.sys_id == conditionMatchedEscSetGr.getUniqueValue()) {
					escalationSet.condition_matched = true;
				}
			}	
		}
		return escalationSets;
	}
	else {
		response.setBody({
			error: {
				message: gs.getMessage("Does not have permission")
			}
		});
		response.setStatus(403);
	}
	
	

})(request, response);
