(function executeRule(current, previous /*null when async*/) {
	
	var rlm2m = new GlideRecord('asmt_m2m_recipientslist_survey');
	rlm2m.addQuery('metric_type', current.metric_type + '');
	rlm2m.addQuery('recipients_list', current.recipients_list + '');
	rlm2m.addQuery('sys_id', '!=', current.getUniqueValue());
	rlm2m.query();
	
	if (rlm2m.hasNext()) {
		gs.addErrorMessage(gs.getMessage('This recipients list already exists.'));
		current.setAbortAction(true);
	}
	
})(current, previous);
