(function executeRule(current, previous /*null when async*/) {
	var sysId = current.table_sys_id;
	var gr = new GlideRecord('sys_attachment');
	gr.addQuery('table_name','ds_document_version');
	gr.addQuery('table_sys_id',sysId);
	gr.query();

	if(gr.next()) {
		gs.addErrorMessage(gs.getMessage("Cannot proceed with attachment upload. Version cannot have more than one attachment."));
		current.setAbortAction(true);
	}
})(current, previous);
