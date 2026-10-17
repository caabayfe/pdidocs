(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var itemId = request.pathParams.item_sys_id;
	if (!GlideStringUtil.isEligibleSysID(itemId))
		throw new sn_ws_err.BadRequestError("item_sys_id should be provided as path param.");
	
	var request_body = request.body.nextEntry();
	var also_request_for = request_body.sysparm_also_request_for;
	
	if (gs.nil(also_request_for))
		throw new sn_ws_err.BadRequestError(gs.getMessage("Invalid also_request_for value"));
	
	var catItem = new sn_sc.CatItem(itemId);
	var response_body = {};
	response_body.invalidUsers = catItem.getInvalidDelegatedUsers(also_request_for.split(','));
	return response_body;
})(request, response);
