(function process(request, response) {
	var sysId = request.queryParams.sysId;
    var serviceManager = new SNC.BusinessServiceManager();
    var result = {
        processStates: serviceManager.getBusinessServiceStates()
    };
	result.fieldLabels = serviceManager.getFieldLabels();
    if(sysId)
        result.model = serviceManager.getBusinessService(sysId);
    return result;
})(request, response);
