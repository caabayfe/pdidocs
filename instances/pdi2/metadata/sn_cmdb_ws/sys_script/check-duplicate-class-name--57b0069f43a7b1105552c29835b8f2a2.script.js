(function executeRule(current, previous /*null when async*/) {
	var gr = new GlideRecord('sn_cmdb_ws_ms_skip_class');
	gr.addQuery('class', current.getValue('class'));
	gr.query();

	if (gr.hasNext()) {
		gs.addErrorMessage(gs.getMessage('Class {0} is already skipped from CMDB 360 analytics population. Cannot add skip same class again!', [GlideStringUtil.escapeHTML(current.getValue('class'))]));
		current.setAbortAction(true);
	}

})(current, previous);
