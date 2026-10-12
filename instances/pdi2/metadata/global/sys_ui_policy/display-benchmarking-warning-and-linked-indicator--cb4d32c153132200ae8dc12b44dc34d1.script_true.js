function onCondition() {
	if (!g_form.isNewRecord())
		g_form.addInfoMessage(getMessage("This is a benchmarking indicator therefore not all fields are editable."));
}
