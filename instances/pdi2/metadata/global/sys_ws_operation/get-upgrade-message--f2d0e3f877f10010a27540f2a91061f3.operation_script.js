(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var scheduleConfig = new CloudResourceDiscoveryUtil();
    var results = scheduleConfig.upgradeMessage();
    
	response.setStatus(200);
	response.setContentType('application/json');
	response.setBody(results);

})(request, response);
