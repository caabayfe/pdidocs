function onCondition() {
	if (!g_form.isNewRecord())
		g_form.addInfoMessage(getMessage("This is a benchmarking data collection therefore not all fields are editable."));
}
