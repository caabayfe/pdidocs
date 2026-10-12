/* eslint-disable no-undef */
/* global gs, sn_ide, sn_glider, request, response */

(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	const { sysId } = request.pathParams;
	// Validate that sysId is provided
	if (!sysId) {
		response.setStatus(400);
		response.setError(gs.getMessage('sysId parameter is required'));
		return;
	}
	// try catch block
	const utils = new global.GliderCustomizationUtil();
	const formatter = new sn_glider.GliderRecordFormatter();

	let unloader;
	try {
		unloader = new sn_ide.IDEMetadataUnloader();
	} catch (e) {
		response.setStatus(500);
		response.setError(gs.getMessage('IDEMetadataUnloader is not available in this instance'));
		return;
	}

	const record = utils.getRecord(sysId);

	if (record) {
		response.setStatus(200);
		response.setBody(formatter.format(record, unloader.unloadRecord(record)));
		return;
	}
	response.setStatus(404);
	response.setError(gs.getMessage('Record not found for sysId: {0}', sysId));
})(request, response);
