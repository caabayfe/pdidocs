function onLoad() {
	if (!g_scratchpad.std_chg_task_props)
		return;
	
	var unmodifiableProp =  g_scratchpad.std_chg_task_props.unmodifiable;
	if (!unmodifiableProp || unmodifiableProp.length == 0)
		return;
	
	var templateFieldHandler = g_form.elementHandlers["std_change_proposal_task.template"];
	if (!templateFieldHandler || templateFieldHandler.type != "GlideTemplateFilter")
		return;
	
	var fieldNames = [];
	for (var i = 0; i < unmodifiableProp.length; i++)
		if (unmodifiableProp[i].name)
			fieldNames.push(unmodifiableProp[i].name);
	
	if (fieldNames.length > 0)
		templateFieldHandler.addIgnoreFields(fieldNames.join(","));
}
