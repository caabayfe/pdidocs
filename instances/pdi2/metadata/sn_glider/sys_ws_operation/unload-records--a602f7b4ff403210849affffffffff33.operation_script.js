/* eslint-disable no-undef */
/* global gs, sn_ide, sn_glider, sn_ws_err, request, response */

function isInvalid(ids) {
	if (!ids || !Array.isArray(ids)) {
		return gs.getMessage(`Request body is empty. Expected string[] of sys_ids`);
	}
}

function isInvalidScope(scopeId) {
	if (!scopeId) {
		return gs.getMessage(`ScopeId is empty. Expected valid scopeId`);
	}

	var gr = new GlideRecord('sys_scope');
	if (!gr.get(scopeId)) {
		return gs.getMessage(`Could not find scope matching ${scopeId} on instance`);
	}
}

(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	const { scopeId } = request.pathParams;
	const ids = request.body.data;

	const idValidationError = isInvalid(ids);
	if (idValidationError) {
		return response.setBody(new sn_ws_err.BadRequestError(idValidationError));
	}

	const scopeValidationError = isInvalidScope(scopeId);
	if (scopeValidationError) {
		return response.setBody(new sn_ws_err.BadRequestError(scopeValidationError));
	}

	try {
		unloader = new sn_ide.IDEMetadataUnloader();
	} catch (e) {
		response.setStatus(500);
		response.setError(gs.getMessage('IDEMetadataUnloader is not available in this instance'));
		return;
	}

	try {
		var records = new GlideRecordSecure('sys_metadata');
		records.orderBy('sys_name');
		records.addQuery('sys_scope', scopeId);
		records.addQuery('sys_id', 'IN', ids);
		records.addActiveQuery();
		records.query();

		var formatter = new sn_glider.GliderRecordFormatter();

		const xmls = [];
		while (records.next()) {
			xmls.push(formatter.format(records, unloader.unloadRecord(records)));
		}

		response.setStatus(200);
		response.setContentType('application/json');
		response.setBody({
			status: 'success',
			xmlRecords: xmls
		});
	} catch (e) {
		response.setStatus(500);
		response.setError(gs.getMessage('[IDE][Metadata-Unload] Error processing records: {0}', [e.message || e]));
	}
})(request, response);
