function onCondition() {
	if(g_form.getValue('component')=='')
		g_form.setSectionDisplay('component_properties', false);
}
