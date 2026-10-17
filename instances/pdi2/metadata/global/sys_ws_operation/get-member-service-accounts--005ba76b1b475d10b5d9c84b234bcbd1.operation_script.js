(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var results = new CloudDiscoveryScheduleConfig().getMemberAccountsRESTUtil(request.pathParams.parent_account,request.pathParams.discover_members,request.pathParams.midServer,false);
	response.setStatus(200);
	response.setContentType('application/json');
	response.setBody(results.memberAccounts);
    
})(request, response);
