function onCondition() {
	var name = g_form.getValue('name');
	if(name)
		g_form.setValue('title', name);
}
