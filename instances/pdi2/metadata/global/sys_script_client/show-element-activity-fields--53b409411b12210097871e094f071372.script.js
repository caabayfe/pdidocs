function onLoad() {
	var isElementActivity = g_scratchpad.elementType == 'wf_element_activity';
    g_form.setVisible("input", isElementActivity); 
	jQuery('#activity_vars').toggle(isElementActivity);
}
