(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	/*
		Path params -
		schedule_page_sys_id

		Body params -
		event_id
		current_start_date
		current_end_date
		new_start_date
		new_end_date
		update_single_occurrence
	*/
	var util = new SchedulePageUtilSNC();
	var dataSourceClass = util.getClassName(request.pathParams.schedule_page_sys_id);

	if (dataSourceClass) {
		var dataSourceObj = util.getObjInstance(dataSourceClass, this);

		var resp = dataSourceObj.updateEvent(request.body.data);
		if (resp.apiError && resp.errorType == 'security' ) {
			var respError = new sn_ws_err.ServiceError();
			respError.setStatus(403);
			respError.setMessage(resp.apiError);
			return respError;
		} else if (resp.apiError)
			return new sn_ws_err.BadRequestError(resp.apiError);
		else
			return resp;
	}
	return new sn_ws_err.BadRequestError(gs.getMessage('A valid implementation for datasource Script Include is missing.'));

})(request, response);
