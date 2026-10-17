(function executeRule(current, previous /*null when async*/) {

	current.setValue('trigger_group_assigned', false);
	current.setValue('run_trigger', 'trigger_field_changes');
	current.setValue('trigger_fields', new TriggerRuleUtilSNC().getDefaultGroupField());
	current.setValue('group', '');

})(current, previous);
