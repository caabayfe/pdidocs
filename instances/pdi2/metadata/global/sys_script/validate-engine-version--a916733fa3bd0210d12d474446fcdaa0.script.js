(function executeRule(current, previous /*null when async*/) {
	var isPublicAccess = current.public_access;
	var gr= new GlideRecord(PDConstants.TABLES.PD_PROCESS_VARIANT);
	gr.addQuery(PDConstants.FIELDS.PROCESS_DEFINITION,current.sys_id);
	gr.query();
	if (isPublicAccess || gr.hasNext()){
		gs.addErrorMessage(gs.getMessage("Update failed. The playbook you are modifying is using features from a different version."));
        current.setAbortAction(true);
	}
})(current, previous);
