(function executeRule(current, previous /*null when async*/) {

	if(current.primary.getDisplayValue() == "true"){
		var gr = new GlideRecord('sn_ex_sp_m2m_action_group');
		gr.addActiveQuery();
		gr.addQuery('group',current.group);
		gr.addQuery('primary',true);
		gr.addQuery('sys_id', '!=', current.getUniqueValue());
		gr.query();
		if(gr.next()){
			current.setAbortAction(true);
			gs.addErrorMessage(gs.getMessage("Only one action can be selected as the primary action."));
		}
	}

})(current, previous);
