(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	var msgSysId    = request.pathParams.id;
	var displayMessage;

	var gr = new GlideRecord("sa_discovery_message");
	if (gr.get(msgSysId)) {
		var errorCode = '' + gr.error_code;
		var errorGr = new GlideRecord('automation_error_code');
		if (errorGr.get(errorCode) && ('SN-1570' === errorGr.getValue('code'))) {
			if (gr.status === '3')
				displayMessage = gs.getMessage('Cannot mark the discovery message as resolved because it is already resolved.');
			else
				(new sn_svcerr.ErrorMgrScript()).resolveMessage(msgSysId);
		} else
			displayMessage = gs.getMessage('Cannot mark the discovery message as resolved because it is not rejected.');
	} else
		displayMessage = gs.getMessage('Cannot perform the action because the discovery message does not exist.');

	if (displayMessage)
		return SvcErrRestHelper.createCustomizedServiceError({status: 400, message: displayMessage});

})(request, response);
