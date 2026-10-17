var SvcErrRestHelper = Class.create();

SvcErrRestHelper.createCustomizedServiceError = function(errorInfo) {
	var serviceError = new sn_ws_err.ServiceError();
	serviceError.setStatus(500);
	
	if (errorInfo.status)
		serviceError.setStatus(errorInfo.status);
	
	if (errorInfo.message)
		serviceError.setMessage(errorInfo.message);
	
	if (errorInfo.detail)
		serviceError.setDetail(errorInfo.detail);
	
	return serviceError;
};

SvcErrRestHelper.prototype = {
    initialize: function() {
    },

    type: 'SvcErrRestHelper'
};
