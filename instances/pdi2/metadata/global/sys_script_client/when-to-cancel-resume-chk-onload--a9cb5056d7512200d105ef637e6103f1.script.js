function onLoad() {
	var simpleConditionTypeId = "d8e8f83a0a0a2c940052a3cac6c2b417";
	var defaultConditionClass = g_scratchpad.sla_metadata.default_conditionclass;
	var currentConditionClass = g_scratchpad.sla_metadata.current_conditionclass;
	
	if (g_form.getControl('condition_class') != undefined)
		currentConditionClass = g_form.getValue('condition_class');
	
	var usingSimple = currentConditionClass ? (currentConditionClass == simpleConditionTypeId) : (defaultConditionClass == "SLAConditionSimple");

	if (!usingSimple)
		return;
	
	if (g_form.isNewRecord()) {
		g_form.setValue('when_to_cancel', 'no_match');
		g_form.setValue('when_to_resume', 'no_match');
		g_form.setReadOnly("when_to_cancel", true);
		g_form.setReadOnly("when_to_resume", true);
	} else {
		if (g_form.getValue('when_to_cancel') != 'on_condition' && g_form.getValue('when_to_cancel') != 'never')
			g_form.setReadOnly("when_to_cancel", true);
		if (g_form.getValue('when_to_resume') != 'on_condition')
			g_form.setReadOnly('when_to_resume', true);
	}
			
	g_form.showFieldMsg("when_to_cancel", getMessage("Cancel conditions cannot be used when the condition type is set to Simple"), "info");
	g_form.showFieldMsg("when_to_resume", getMessage("Resume conditions cannot be used when the condition type is set to Simple"), "info");
}
