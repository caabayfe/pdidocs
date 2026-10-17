function svcFindCisWithActiveErrors(errorCode) {
	var gr = new GlideRecord('error_to_service');
	gr.addQuery('err_error_code', errorCode);
	gr.addQuery('svc_ignore_errors', false);
	gr.query();
	var prefix = '';
	var ids = '';
	while (gr.next()) {
		ids = ids + prefix + gr.getValue('svc_ci_id');
		prefix = ',';
	}
	return ids;
}
