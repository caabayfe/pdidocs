(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var table = request.pathParams.table || '';
	if (!table)
		return new sn_ws_err.BadRequestError('Table not provided');

	var sysId = request.pathParams.sys_id || '';
	if (!sysId)
		return new sn_ws_err.BadRequestError('Task Sys ID not provided');

	if (!gs.tableExists(table))
		return new sn_ws_err.BadRequestError('Invalid Tablename provided');

	var gr = new GlideRecordSecure(table);
	gr.addQuery('sys_id', sysId);
	gr.query();
	if (!gr.next())
		return new sn_ws_err.NotFoundError('Record not found');

	try {
		new global.TaskUtils().triggerRefreshImpactedServices(gr, true);
		return {
			'status': 'success',
			'message': gs.getMessage('Refresh impacted services has been initiated') || ''
		};
	} catch (err) {
		return new sn_ws_err.NotFoundError('Failed to initiate Refresh impacted services');
	}

})(request, response);
