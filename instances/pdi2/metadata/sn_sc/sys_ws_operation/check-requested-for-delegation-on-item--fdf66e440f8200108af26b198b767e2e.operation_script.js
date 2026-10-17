(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var itemId = request.pathParams.item_sys_id;
	if (!GlideStringUtil.isEligibleSysID(itemId))
		throw new sn_ws_err.BadRequestError("item_sys_id should be provided as path param.");
	
	var delegatedUser = request.pathParams.user_sys_id;
	if (!GlideStringUtil.isEligibleSysID(delegatedUser))
		throw new sn_ws_err.BadRequestError("user_sys_id value should be provided as path param.");
	
	var catItem = new sn_sc.CatItem(itemId);
	if (!catItem.canView()) {
	    throw new sn_ws_err.BadRequestError("Security constraints prevent delegation on item");
	}
	var response_body = {};
	response_body.result = catItem.isDelegationAllowed(delegatedUser);
	if (!response_body.result) {
		response_body.errMsg = gs.getMessage("Item is unavailable for this user");
	}
	return response_body;
})(request, response);
