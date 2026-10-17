function onLoad() {
	if (!g_user.hasRole("itil"))
		return;

	if (!g_form.hasField('comments'))
		return;

	var labelText = g_form.getLabelOf('comments');
	if (labelText.substring(labelText.length-1) == ':')
		labelText = labelText.substring(0, labelText.length -1);

	labelText += new GwtMessage().getMessage(' (Customer visible)');
	g_form.setLabelOf('comments', labelText);
}
