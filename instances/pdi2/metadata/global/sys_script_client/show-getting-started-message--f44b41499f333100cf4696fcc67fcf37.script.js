function onLoad() {
	if (g_form.isNewRecord())
		g_form.addInfoMessage(getMessage("You can easily create a new REST API. To get started, give your API a name and ID."));
}
