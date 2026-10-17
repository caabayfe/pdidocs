function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	var fieldNameData = {
		breakdownDefinitionId: g_form.getValue("sla_breakdown_definition"),
		breakdownTable: g_form.getValue("sla_breakdown_definition_field.sla_breakdown_definition.sla_breakdown_table"),
		currentBreakdownField: g_scratchpad.breakdownFieldName,
		formBreakdownField: (isLoading ? g_scratchpad.breakdownFieldName : newValue),
		sourceTable: g_form.getValue("sla_breakdown_definition_field.sla_breakdown_definition.task_table")
	};
	
	g_form.setValue("fieldname_data", JSON.stringify(fieldNameData));
	
	if (isLoading) //|| newValue === "")
		onSelChange("sla_breakdown_definition_field.sla_breakdown_definition.sla_breakdown_table");
	
	onSelChange("sla_breakdown_definition_field.sla_breakdown_definition.task_table");

	g_form.clearValue("fieldname_data");
}
