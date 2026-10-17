(function executeRule(current, previous /*null when async*/) {

	var gr = new GlideRecord('cmdb_rel_team');
	gr.addQuery('ci', current.getValue('ci'));
	gr.addQuery('is_primary', true);
	gr.query();
	
	if(gr.next() && current.is_primary && gr.getUniqueValue() != current.getUniqueValue()){
		gs.addErrorMessage(gs.getMessage('{0} group is already indicated as the primary group for this CI, please disable that group\'s primary status before setting this one to true', gr.user_group.getDisplayValue()));
		current.setAbortAction(true);
	}
	
	var gr2 = new GlideRecord('cmdb_rel_team');
	gr2.addQuery('ci', current.getValue('ci'));
	gr2.addQuery('group_type', current.getValue('group_type'));
	gr2.query();
	
	if(gr2.next() && gr2.getUniqueValue() != current.getUniqueValue()){
		gs.addErrorMessage(gs.getMessage('{0} is already designated as the {1} for this configuration item.', [gr2.user_group.getDisplayValue(), gr2.group_type.getDisplayValue()]));
		current.setAbortAction(true);
	}

})(current, previous);
