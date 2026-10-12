(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    // implement resource here
	var userID = request.pathParams.user_id;
	var gr = new ScopedGlideRecord('sys_user');
	if(!gr.get(userID))
		throw new sn_ws_err.BadRequestError("Invalid User ID!");
	
	if (!gr.canRead())
		throw new sn_ws_err.BadRequestError("Security Constraints prevent accessing the User Address");
	
	if (!sn_sc.CartJS.canViewRF() && !gs.getUser().getID().equals(userID))
		throw new sn_ws_err.BadRequestError("Security Constraints prevent accessing the User Address");

	return sn_sc.CartJS.getRequestedForAddress(userID);

})(request, response);
