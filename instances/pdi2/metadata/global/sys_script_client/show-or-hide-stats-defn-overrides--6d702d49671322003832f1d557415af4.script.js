function onLoad() {
	var overridden = g_form.getValue('overridden') == 'true';
	if (!overridden)
	  g_form.hideRelatedList("REL:069dd909671322003832f1d557415a99");
	else {
		g_form.addInfoMessage("This stats definition has overridden values. Please check the related list(s) below.");
		g_form.showRelatedLists();
	}
}
