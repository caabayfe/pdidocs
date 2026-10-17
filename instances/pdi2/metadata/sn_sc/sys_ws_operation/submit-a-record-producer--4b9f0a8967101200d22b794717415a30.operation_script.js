(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var recordProducerId = request.pathParams.sys_id;
	var request_body = request.body.nextEntry();
	var noValidation =  (request_body.sysparm_no_validation == 'true');

	var catalogUtil = new RestCatalogUtil();
	var isMobile = false;

	if (request.queryParams.sysparm_view) {
		var viewType = '' + request.queryParams.sysparm_view;
		viewType = viewType.toLowerCase();
		if(viewType == 'mobile')
			isMobile = true;
	}

	if(!catalogUtil.isValidItem(recordProducerId, 'sc_cat_item_producer'))
		throw new sn_ws_err.NotFoundError('Record Producer does not exist');
	
	var also_request_for = request_body.sysparm_also_request_for;
	if (!gs.nil(also_request_for)) 
		throw new sn_ws_err.BadRequestError('Cannot request Record Producer for other users.');

	var catalogItem = new sn_sc.CatItem(recordProducerId);

	if(!catalogItem.canView(isMobile))
		throw new sn_ws_err.BadRequestError("Security Constraints prevent access to the Item");

	for (var key in request_body.variables)
		if (request_body.variables.hasOwnProperty(key) && request_body.variables[key] != null && typeof(request_body.variables[key]) !== 'string')
			request_body.variables[key] = catalogUtil.getFieldValueAsString(key, request_body.variables[key], recordProducerId);

	var variables = request_body.variables || {};

	if (!noValidation) {
		//Mandatory Variables Check
		if(!catalogUtil.checkMandatoryVariables(recordProducerId, variables))
			throw new sn_ws_err.BadRequestError('Mandatory variables are not filled');
	}
	var messages = catalogUtil.validateVariableRegex(recordProducerId, variables);
	if (messages && messages.length > 0) {
		var errorResponse = {};
		errorResponse.errMsg = messages.join();
		response.setStatus(400);
		return errorResponse;
	}

	var mrvsErrorMessages = catalogUtil.validateMaxRowCountMultiRowVS('sc_cat_item', recordProducerId , recordProducerId, request_body.variables); 
	if (mrvsErrorMessages && mrvsErrorMessages.length > 0) {
		var errors = mrvsErrorMessages.join();
		throw new sn_ws_err.BadRequestError(errors);
	}

	request_body.sysparm_id = recordProducerId;
	request_body.sysparm_action = 'execute_producer';
	if (!request_body.sysparm_item_guid)
		request_body.sysparm_item_guid = gs.generateGUID('');

	var response_body = {};
	try {
		response_body = catalogItem.submitProducer(request_body);
	} catch(e) {
		gs.debug(e);
		var catalogExceptionUtils = new global.CatalogExceptionUtils();
		if (catalogExceptionUtils.isValveException(e))
			response_body = catalogExceptionUtils.handleValveExceptionInPortal(e);
		else
			throw sn_ws_err.ServiceError("Invalid Request");
	}
	if (response_body.errMsg)
		response.setStatus(400);

	return response_body;
})(request, response);
