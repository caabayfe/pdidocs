(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

   var escalationSysId = request.queryParams.escalation_sys_id;
	if (!escalationSysId)
		return new sn_ws_err.BadRequestError("Escalation sys_id not provided");
	
	return  new OnCallEscalationUtil().getEscalationById(escalationSysId + '');
	

})(request, response);
