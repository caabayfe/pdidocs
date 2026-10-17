(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	/*
		Path params -
		schedule_page_sys_id

		Query params -
		sysparm_sys_id
		start_date
		end_date
		format - dhtmlx/ical
	*/
	var util = new SchedulePageUtilSNC();
	var dataSourceClass = util.getClassName(request.pathParams.schedule_page_sys_id);

	if (dataSourceClass) {
		var dataSourceObj = util.getObjInstance(dataSourceClass, this);
		dataSourceObj.setSchedulePageId(request.pathParams.schedule_page_sys_id);

		var p = dataSourceObj.processQueryParams(request.queryParams);
		if (dataSourceObj.hasApiError(p))
			return new sn_ws_err.BadRequestError(p.apiError);
		var resp = dataSourceObj.getEvents(p);
		if (resp.apiError)
			return new sn_ws_err.BadRequestError(resp.apiError);
		else
			return resp;
	}
	return new sn_ws_err.BadRequestError(gs.getMessage('A valid schedule page ID is necessary to get the associated schedule events.'));

})(request, response);
