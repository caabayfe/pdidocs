(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var request_body = request.body.nextEntry();
	var itemId = '' + request.pathParams.sys_id;
	var catItem = new sn_sc.CatItem(itemId);
	if(!catItem.canView()) {
		throw new sn_ws_err.BadRequestError("Security constraints prevents access to Item");
		}
	var data = catItem.read({name: ''});
	if (!data.name)
		throw new sn_ws_err.BadRequestError("Invalid Catalog Item");
	request_body.sysparm_id = itemId;
	var quantity = '' + request_body.sysparm_quantity;
	if (!/^\+?([0-9]*)$/.test(quantity) || parseInt(quantity) < 1)
		throw new sn_ws_err.BadRequestError("Invalid Quantity value");
	else
		request_body.sysparm_quantity = quantity;
    var util = new global.GlobalServiceCatalogUtil();
	return util.getCatalogItemPrice(request_body);
})(request, response);
