(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	function addItemsToCart(guideJS, items, cart) {
		var itemDetails;
		for(i=0; i<items.length; i++) {
			itemDetails = items[i];
			itemDetails.sysparm_id = itemDetails.sys_id;
			itemDetails.sysparm_quantity = '' + (itemDetails.sysparm_quantity || '1');
			if(!itemDetails.variables)
				itemDetails.variables = {};
			itemDetails.sysparm_active = itemDetails.sysparm_id;
			guideJS.navigateFromMap(itemDetails);
		}
		cart.activateGuide();
	}

    var guideId = request.pathParams.sys_id;
	var catalogUtil = new RestCatalogUtil();
	if(!catalogUtil.isValidItem(guideId, 'sc_cat_item_guide'))
		throw new sn_ws_err.NotFoundError('Order guide is not found');
	var itemJS = new sn_sc.CatItem(guideId);
	if(!itemJS.canView())
		throw new sn_ws_err.BadRequestError('Security constraints prevent access to this order guide');

	var request_body = request.body.nextEntry();
	var requestedItems = request_body.items || [];
	var noValidation =  (request_body.sysparm_no_validation == 'true');	
	var also_request_for = request_body.sysparm_also_request_for;
	if (!gs.nil(also_request_for)) 
		throw new sn_ws_err.BadRequestError('Cannot request Order Guide for other users.');
	
	var guideJS = new sn_sc.OrderGuide(guideId);
	var cart;
	if(guideJS.isTwoStep() || guideJS.isSequencedGuide())
		cart = new sn_sc.CartJS(guideJS.getID());
	else
		cart = new sn_sc.CartJS();
	var guideItems = cart.getCrumbs();
	if(guideItems.length != requestedItems.length)
		throw new sn_ws_err.BadRequestError('All required items not sent');
	guideItems = guideItems.join(',');
	for(var i=0; i<requestedItems.length; i++) {
		var requestedItem = requestedItems[i];
		var itemId = requestedItem.sys_id;
		var quantity = '1';
		if(requestedItem.sysparm_quantity)
			quantity = ''  + requestedItem.sysparm_quantity;
		if(!itemId)
			throw new sn_ws_err.BadRequestError('Item id is required');
		var also_request_item_for = requestedItem.sysparm_also_request_for;
		if (!gs.nil(also_request_item_for))
			throw new sn_ws_err.BadRequestError('Order guide items cannot be requested for others.');
		if(guideItems.indexOf(itemId) > -1) {
			itemJS = new sn_sc.CatItem(itemId);
			var itemVars = requestedItem.variables || {};
			for (var key in itemVars)
				if (itemVars.hasOwnProperty(key) && itemVars[key] != null && typeof(itemVars[key]) !== 'string')
					itemVars[key] = catalogUtil.getFieldValueAsString(key, itemVars[key], itemId);
					
			if(!catalogUtil.isValidItem(itemId, 'sc_cat_item'))
				throw new sn_ws_err.NotFoundError('One of more of the items are not valid');
			if(!itemJS.canView())
				throw new sn_ws_err.BadRequestError('Security constraints prevent ordering of the item');
			if (!noValidation) {
				if(!catalogUtil.checkMandatoryVariables(itemId, itemVars))
					throw new sn_ws_err.BadRequestError('Mandatory variables are required');
			}
			var messages = catalogUtil.validateVariableRegex(itemId, itemVars);
			if (messages && messages.length > 0) {
				var errorResponse = {};
				var errorMsg = "Variable validation failed for item: " + itemId + ". ";
				errorMsg = errorMsg + messages.join();
				errorResponse.errMsg = errorMsg;
				response.setStatus(400);
				return errorResponse;
			}

			if(!/^\+?([0-9]*)$/.test(quantity))
				throw new sn_ws_err.BadRequestError('Invalid quantity value');
			
		} else
			throw new sn_ws_err.BadRequestError('Invalid items sent');
	}
	var checkoutDetails;
	try {
		addItemsToCart(guideJS, requestedItems, cart);
		checkoutDetails = cart.checkoutGuide();
	} catch(e) {
		gs.debug(e);
		throw new sn_ws_err.ServiceError('Error during checkout of items');
	}
	return checkoutDetails;

})(request, response);
