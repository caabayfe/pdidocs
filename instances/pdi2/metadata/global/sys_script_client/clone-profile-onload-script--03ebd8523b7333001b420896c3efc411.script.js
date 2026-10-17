function onLoad() {
	if(g_form.isNewRecord())
		g_form.addInfoMessage(new GwtMessage().getMessage("Preservers, exclusions and cleanup scripts can be added to the profile once it is saved."));
}
