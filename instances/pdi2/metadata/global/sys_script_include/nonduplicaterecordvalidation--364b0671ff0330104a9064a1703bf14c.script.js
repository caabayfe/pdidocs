nonDuplicateRecordValidation = function(current, previous) {
	if (current.getValue('announcement_config') == previous.getValue('announcement_config') && 
		current.getValue('announcement') == previous.getValue('announcement')) {
		return false;	
	}
	
	var gr = new GlideRecord('sys_ux_m2m_banner_announcement');
	gr.addQuery('announcement_config', current.getValue('announcement_config'));
	gr.addQuery('announcement', current.getValue('announcement'));
	gr.query();
	
	if (gr.hasNext()) {
		gs.addErrorMessage(gs.getMessage('Cannot create duplicate association of banner announcement to configuration record.'));
		current.setAbortAction(true);
		return false;
	}
	return true;
};
