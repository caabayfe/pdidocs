(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var slaTimer = new SLATimer();
	var params = slaTimer.assign({}, request.queryParams, request.body.data);

	if (!params.task_ids)
		return new sn_ws_err.BadRequestError('Could not retrieve sla timer data because [task_ids] not provided.');

	return slaTimer.get(params);
})(request, response);
