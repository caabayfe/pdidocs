(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var exportSysId = request.pathParams.export_id;
    var current = new GlideRecord('sysauto_par');
	if (!current.get(exportSysId)) {
		response.setStatus(404);
		return;
	}
	if (!current.canRead() || current.getBooleanAttribute('disable_execute_now')) {
		response.setStatus(403);
		return;
	}
    gs.executeNow(current);
})(request, response);
