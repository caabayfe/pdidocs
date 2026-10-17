function onCondition() {
	if (g_form.getEditableFields().length)
		g_form.addInfoMessage(getMessage("This Shift is in Draft State. Click on Publish to make it live."));
}
