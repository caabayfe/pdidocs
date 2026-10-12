(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	function setCascadeVariableValues(variables, valueMap) {
		for(var i=0; i<variables.length; i++) {
			var variable = variables[i];
			if(valueMap[variable.id])
				variable.value = valueMap[variable.id];
			if(variable.children)
				variable.children = setCascadeVariableValues(variable.children, valueMap);
		}
		return variables;
	}

	var guideId = request.pathParams.sys_id;
	var request_body = request.body.nextEntry();
	var noValidation =  (request_body.sysparm_no_validation == 'true');	
	var catalogUtil = new RestCatalogUtil();

	if(!catalogUtil.isValidItem(guideId, 'sc_cat_item_guide'))
		throw new sn_ws_err.NotFoundError('Order Guide does not exists');
	var itemJS = new sn_sc.CatItem(guideId);
	if(!itemJS.canView())
		throw new sn_ws_err.BadRequestError('Security constraints prevent access to the item');
	
	var also_request_for = request_body.sysparm_also_request_for;
	if (!gs.nil(also_request_for)) 
		throw new sn_ws_err.BadRequestError('Cannot request Order Guide for other users.');
	
	if(request_body.variables == undefined)
		request_body.variables = {};

	for (var key in request_body.variables)
		if (request_body.variables.hasOwnProperty(key) && request_body.variables[key] != null && typeof(request_body.variables[key]) !== 'string')
			request_body.variables[key] = catalogUtil.getFieldValueAsString(key, request_body.variables[key], guideId);

	if (!noValidation) {
		if(!catalogUtil.checkMandatoryVariables(guideId, request_body.variables))
			throw new sn_ws_err.BadRequestError('Mandatory variables are not filled');
	}
	var messages = catalogUtil.validateVariableRegex(guideId, request_body.variables);
	if (messages && messages.length > 0) {
		var errorResponse = {};
		errorResponse.errMsg = messages.join();
		response.setStatus(400);
		return errorResponse;
	}
	request_body.sysparm_id = guideId;
	request_body.sysparm_guide = guideId;
	var guideJS = new sn_sc.OrderGuide(guideId);
	//Flush any partially filled cart
	var cartJS;
	if(guideJS.isTwoStep() || guideJS.isSequencedGuide())
		cartJS = new sn_sc.CartJS(guideId);
	else
		cartJS = new sn_sc.CartJS();
	cartJS.newGuide();
	cartJS.setGuide(guideId);
	cartJS.setGuideActive(guideId);
	cartJS.update();
	
	var guideInitSummary = guideJS.init(request_body);
	if (guideInitSummary.errMsg) {
		response.setStatus(400);
		return guideInitSummary.errMsg;
	}
	var includedItems = guideInitSummary.items;
	var cascadeVarMap = guideInitSummary.cascade_variable_map;
	var itemList = [];
	for(var i=0; i<includedItems.length; i++) {
		var includedItem = includedItems[i];
		var catItem = new sn_sc.CatItem(includedItem.sys_id);
		var itemDetails = catItem.getItemSummary();
		
		itemDetails.show_quantity = includedItem.show_quantity;
		itemDetails.quantity = includedItem.quantity;
		itemDetails.order = includedItem.order;
		itemDetails.variables = setCascadeVariableValues(catItem.getVariables(false), cascadeVarMap);

		var sets = catItem.getVariableSet();
		itemDetails.ui_policy = new global.GlobalServiceCatalogUtil().getCatalogUIPolicy(includedItem.sys_id, sets.join(','));
		itemDetails.client_script = catalogUtil.getClientScripts(includedItem.sys_id, 'desktop');
		itemDetails.data_lookup = catItem.getDataLookUps();

		itemList.push(itemDetails);
	}
	return itemList;

})(request, response);
