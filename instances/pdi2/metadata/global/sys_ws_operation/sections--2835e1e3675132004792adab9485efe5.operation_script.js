(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	return new OCRotationV2()
		.setStartDate(request.queryParams.start_date || request.body.data.start_date)
		.setEndDate(request.queryParams.end_date || request.body.data.end_date)
		.setGroupIds(request.queryParams.group_ids || request.body.data.group_ids)
		.setRotaIds(request.queryParams.rota_ids || request.body.data.rota_ids)
		.setRosterIds(request.queryParams.roster_ids || request.body.data.roster_ids)
		.setUserIds(request.queryParams.user_ids || request.body.data.user_ids)
		.getSections();
})(request, response);
