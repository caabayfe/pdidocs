function onLoad() {
	if (g_form.getValue('source') != 'default_override')
		g_form.hideRelatedList("contact_default_override");
	else
		g_form.showRelatedList("contact_default_override");
}
