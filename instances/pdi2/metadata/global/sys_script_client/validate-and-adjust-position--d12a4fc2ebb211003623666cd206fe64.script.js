function onSubmit() {
	var position = g_form.getIntValue("index");

	if (position < 1) {
		g_form.showFieldMsg("index", "Position must be greater than 0", true);
		return false;
	}
		
	g_form.setValue("index", position - 1);
}
