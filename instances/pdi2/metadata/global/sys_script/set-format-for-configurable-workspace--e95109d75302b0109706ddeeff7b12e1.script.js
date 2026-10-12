(function executeRule(current, previous /*null when async*/) {
	var prevFormatForConfigurableWorkspace = previous.format_for_configurable_workspace;
	var uiaction = current.sys_id;
	var uxFomAction = new GlideRecord('sys_ux_form_action');
	uxFomAction.addQuery('ui_action', uiaction);
	uxFomAction.query();
	var hasUxFormActionWrapper = uxFomAction.hasNext();

	var gru = GlideScriptRecordUtil.get(current);
	if (hasUxFormActionWrapper != prevFormatForConfigurableWorkspace && gru.getChanges().length > 0) {
		current.setEngineParameter("com.glide.policy.UpdateSyncher", "false"); //This line prevents update record creation without disabling future business rules as would happen if we called setWorkflow(false) instead.
		current.setValue('format_for_configurable_workspace', hasUxFormActionWrapper);
		current.update(); //if the wrapper is deleted, need to reset format_for_configurable_workspace so that when update it's triggered business rules.
	} else {
		current.setValue('format_for_configurable_workspace', hasUxFormActionWrapper);
	}
})(current, previous);
