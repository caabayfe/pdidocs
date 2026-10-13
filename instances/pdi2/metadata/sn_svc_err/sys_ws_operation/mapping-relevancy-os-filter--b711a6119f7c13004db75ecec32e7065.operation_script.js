(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	response.setStatus(200);
	response.setContentType('application/json');
	response.setBody(sn_svcerr.ErrorMgrScript.getMappingRelevancyOSFilter());
})(request, response);
