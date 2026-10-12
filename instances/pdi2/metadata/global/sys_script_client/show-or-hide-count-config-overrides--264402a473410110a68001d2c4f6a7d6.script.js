function onLoad() {
	var overridden = g_form.getValue('overridden') == 'true';
	if (!overridden)
	   g_form.hideRelatedList("REL:90c3066473410110a68001d2c4f6a78d");
	else {
		g_form.addInfoMessage("This scripted definition has overridden values. Please check the related list(s) below.");
		g_form.showRelatedLists();
	}
}
