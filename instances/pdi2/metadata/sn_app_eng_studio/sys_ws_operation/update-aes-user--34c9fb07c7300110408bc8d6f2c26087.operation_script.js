(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    // defaulting to 'full' maintains backwards compatibility for flow App Intake Request V1
    var permissionType = request.body && request.body.data && request.body.data.permission_type || CreatorStudioConstants.permissionType.FULL;
    var sysUser = request.body && request.body.data && request.body.data.sys_user;

	if (sysUser) {
		var appIntakeUtils = new AESUserIntake();
		var insertResult = appIntakeUtils.userInsert(sysUser, permissionType);
		/* Example output of appIntakeUtils.userInsert:
		 * "result": {
		 *   "insertUserResult": "7a2d7753534c0110b846ddeeff7b12b2",
		 *   "insertGroupResult": "7edfa31e6dbc0110f87785692ab45ccd",
		 *   "action": "add"
		 * }
		 */

		response.setBody(insertResult);
		response.setStatus(200);
	} else {
		throw new sn_ws_err.ServiceError()
			.setStatus(400)
			.setMessage(gs.getMessageLang("Request requires a sys_user.", "en"))
			.setDetail(gs.getMessage("Creating or updating a user requires a sys_user."));
	}

})(request, response);
