(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    response.setContentType('application/json');
    var param = request.queryParams;
    var alertSysId = (param.alertId) ? param.alertId : '';

    if (!alertSysId) {
		exception=new sn_ws_err.ServiceError().setStatus(400);
		exception.setMessage("The paramer alertId is mandatory");
		throw exception;
    }

    var processor = new SNC.ServiceAnalyticsProcessor();
    var result = processor.getPossibleRootCausesForAlert(alertSysId);
    
	return JSON.parse(result);


})(request, response);
