function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading)
		return;
	
    g_form.hideFieldMsg("when_to_resume");
	g_form.setReadOnly("when_to_resume", false);
	
	g_form.hideFieldMsg("when_to_cancel");
	g_form.setReadOnly("when_to_cancel", false);
	
	var currentConditionClass = g_form.getValue('condition_class');
	var simpleConditionTypeId = "d8e8f83a0a0a2c940052a3cac6c2b417";
	var defaultConditionClass = g_scratchpad.sla_metadata.default_conditionclass;
		
	var usingSimple = currentConditionClass ? (currentConditionClass == simpleConditionTypeId) : (defaultConditionClass == "SLAConditionSimple");

	if (!usingSimple)
		return;

	var fldMsg = '';
	if (g_form.getValue("when_to_resume") == 'on_condition')
		fldMsg = 'When to resume';
	else
		g_form.setReadOnly("when_to_resume", true);
				
	if ((g_form.getValue("when_to_cancel") == 'on_condition') || (g_form.getValue("when_to_cancel") == 'never')) {
		if (fldMsg != '') 
			fldMsg += ' / ';
		fldMsg += 'When to cancel';
	} else
		g_form.setReadOnly("when_to_cancel", true);
				
	if (fldMsg != '')
		g_form.addErrorMessage(new GwtMessage().getMessage('{0} conditions cannot be used when the condition type is set to Simple', fldMsg));
				
	g_form.showFieldMsg("when_to_resume", getMessage("Resume conditions cannot be used when the condition type is set to Simple"), "info");
	g_form.showFieldMsg("when_to_cancel", getMessage("Cancel conditions cannot be used when the condition type is set to Simple"), "info");
}
