function onLoad() {
	
	var templateFieldHandler = g_form.elementHandlers["std_change_proposal.template_value"];
	if (templateFieldHandler)
		templateFieldHandler.addIgnoreFields(g_scratchpad.restrictedFieldsToIgnore);
   
}
