(function executeRule(current, previous /*null when async*/) {

		var gr = new GlideRecord('sn_ex_sp_m2m_action_group');
		gr.addActiveQuery();
		gr.addQuery('group',current.group);
		gr.addQuery('sys_id', '!=', current.getUniqueValue());
		gr.addQuery('action', current.action);
		gr.query();
		if(gr.next()){
			current.setAbortAction(true);
			gs.addErrorMessage(gs.getMessage("Actions cannot be duplicated in a group."));
		}

})(current, previous);
