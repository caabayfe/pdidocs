(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var recordProducerId = request.pathParams.sys_id;
	var request_body = request.body.nextEntry();

	var catalogUtil = new RestCatalogUtil();

	if(!catalogUtil.isValidItem(recordProducerId, 'sc_cat_item_producer'))
		throw new sn_ws_err.NotFoundError('Record Producer does not exist');

	var catalogItem = new sn_sc.CatItem(recordProducerId);

	if(!catalogItem.canView())
		throw new sn_ws_err.BadRequestError("Security Constraints prevent access to the Item");

	for (var key in request_body.variables)
		if (request_body.variables.hasOwnProperty(key) && request_body.variables[key] != null && typeof(request_body.variables[key]) !== 'string')
			request_body.variables[key] = request_body.variables[key].toString();

	var variables = request_body.variables || {};

	var mrvsErrorMessages = catalogUtil.validateMaxRowCountMultiRowVS('sc_cat_item', recordProducerId , recordProducerId, request_body.variables);
	if (mrvsErrorMessages && mrvsErrorMessages.length > 0) {
		var errors = mrvsErrorMessages.join();
		throw new sn_ws_err.BadRequestError(errors);
	}

	request_body.sysparm_id = recordProducerId;
	request_body.sysparm_action = 'save_producer';

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
