function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	var fieldOption = g_form.getOption("schedule_source", "task_field");
	var tableLabel = g_scratchpad.sla_metadata.task_table_labels[newValue];
	
	if (fieldOption)
		if (tableLabel)
			fieldOption.text = new GwtMessage().getMessage("{0} field", tableLabel);
		else
			fieldOption.text = getMessage("Task field");
}
