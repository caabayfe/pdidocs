function onLoad() {
	var overridden = g_form.getValue('overridden') == 'true';
	if (!overridden)
	   g_form.hideRelatedLists();
	else {
		g_form.addInfoMessage("This count configuration has overridden values. Please check the related list(s) below.");
		g_form.showRelatedLists();
	}
}
