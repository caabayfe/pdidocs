(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var groupId = JSUtil.nil(request.queryParams.group_id) ? "" : request.queryParams.group_id;
	var startDate = JSUtil.nil(request.queryParams.start_date) ? "" : request.queryParams.start_date;
	var escalationPathUtil = new OCEscalationPathUtil().setCheckAccess(true);
	return escalationPathUtil.getNextRotasList(groupId, startDate);

})(request, response);
