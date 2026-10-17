(function executeRule(current, previous /*null when async*/ ) {
	if (current.isNewRecord())
		return;

    var gr = new GlideRecord('sys_record_hierarchy_status');
    if (!gr.get(current.sys_id)) {
        gs.addErrorMessage(
            gs.getMessage("This record hierarchy is missing an accompanying status record and may not be operating as expected. Please click the 'Reconcile Hierarchy' related link below to correct this.")
        );
    }

})(current, previous);
