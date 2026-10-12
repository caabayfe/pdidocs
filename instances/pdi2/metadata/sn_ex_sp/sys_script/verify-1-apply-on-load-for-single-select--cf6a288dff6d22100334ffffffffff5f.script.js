(function executeRule(current, previous /*null when async*/) {
	var filterDefinitionId = current.req_filter_definition;
	var filterConditionGr = new GlideRecord('sn_ex_sp_request_filter_config');
	filterConditionGr.addQuery('req_filter_definition', filterDefinitionId);
	filterConditionGr.addQuery('sys_id', '!=', current.sys_id);
	filterConditionGr.addQuery('apply_on_load', true);
	filterConditionGr.query();
	if (filterConditionGr.next()) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage("Multiple 'Apply on load' settings are not supported for single select definitions. Please disable 'Apply on load' for : {0}" , [filterConditionGr.getDisplayValue()]));
	}
})(current, previous);
