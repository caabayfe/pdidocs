function onCondition() {
	if (g_form.getValue('workflow.access') == 'package_private')
	    g_form.setValue('condition_type','');

	g_form.setSectionDisplay("conditions", false);
}
