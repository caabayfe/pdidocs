(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    // implement resource here
    var request_body = request.body.nextEntry();

    var cartItemID = '' + request.pathParams.cart_item_id;
    var noValidation = (request_body.sysparm_no_validation == 'true');

    var gr = new GlideRecord('sc_cart_item');
    if (!gr.get(cartItemID) || !gr.canRead())
        throw new sn_ws_err.NotFoundError("Either the Cart Item ID is invalid or Security constraints prevents access to it!");

    if (!request_body.sysparm_id)
        request_body.sysparm_id = gr.getValue("cat_item");
    else if (request_body.sysparm_id != gr.getValue("cat_item"))
        throw new sn_ws_err.BadRequestError("Cart Item ID & Item ID doesn't match to a record!");

    var quantity = '' + request_body.sysparm_quantity;

    if (!/^\+?([0-9]*)$/.test(quantity))
        throw new sn_ws_err.BadRequestError("Invalid Quantity value");
    else
        //Force convert quantity to String
        request_body.sysparm_quantity = quantity;

    var itemId = '' + request_body.sysparm_id;
    var catItem = new sn_sc.CatItem(itemId);
    if (!catItem.canView())
        throw new sn_ws_err.NotFoundError("Security constraints prevent access to the Item");

	var catUtil = new RestCatalogUtil();
    for (var key in request_body.variables)
        if (request_body.variables.hasOwnProperty(key) && request_body.variables[key] != null && typeof(request_body.variables[key]) !== 'string')
        	request_body.variables[key] = catUtil.getFieldValueAsString(key, request_body.variables[key], itemId);

    if (!noValidation) {
        if (!catUtil.checkMandatoryVariables(itemId, request_body.variables))
            throw new sn_ws_err.BadRequestError('Mandatory Variables are required');
    }

    var messages = catUtil.validateVariableRegex(itemId, request_body.variables);
    if (messages && messages.length > 0) {
		var errorResponse = {};
		errorResponse.errMsg = messages.join();
		response.setStatus(400);
		return errorResponse;
	}

    var mrvsErrorMessages = catUtil.validateMaxRowCountMultiRowVS('sc_cart_item', cartItemID, itemId, request_body.variables);
    if (mrvsErrorMessages && mrvsErrorMessages.length > 0) {
        var errors = mrvsErrorMessages.join();
        throw new sn_ws_err.BadRequestError(errors);
    }

    //Find out the cart name and then work through to handle wish list cart
    var cartName = "";
    var cartItemGr = new GlideRecordSecure('sc_cart_item');
    if (cartItemGr.get(cartItemID))
        cartName = '' + cartItemGr.cart.name;

    var cart = new sn_sc.CartJS(cartName);
    try {
        response.setStatus(201);
        return cart.updateCart(request_body, cartItemID);
    } catch (e) {
		var catalogExceptionUtils = new global.CatalogExceptionUtils();
		if(catalogExceptionUtils.isCartException(e)) {
			response.setStatus(400);
			return catalogExceptionUtils.handleCartExceptionInPortal(e);
		}
        gs.debug(e);
        throw new sn_ws_err.BadRequestError("Invalid Request");
    }

})(request, response);
