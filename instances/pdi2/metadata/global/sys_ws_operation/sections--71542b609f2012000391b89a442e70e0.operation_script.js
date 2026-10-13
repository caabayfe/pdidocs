(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	return new OCRotationV2()
		.setStartDate(request.queryParams.start_date)
		.setEndDate(request.queryParams.end_date)
		.setGroupIds(request.queryParams.group_ids)
		.setRotaIds(request.queryParams.rota_ids)
		.setRosterIds(request.queryParams.roster_ids)
		.setUserIds(request.queryParams.user_ids)
		.getSections();
})(request, response);
