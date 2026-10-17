(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var schUtil = new SchedulePageUtilSNC();
	var pg = schUtil.getSchedulePageById(request.pathParams.schedule_page_sys_id);
	if (pg) {
		return schUtil.getSchedulePageInfo(pg);
	}
	new sn_ws_err.NotFoundError(gs.getMessage('Page not found'));

})(request, response);
