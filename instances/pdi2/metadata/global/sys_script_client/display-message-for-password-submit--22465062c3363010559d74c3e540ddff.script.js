function onLoad() {
   //Type appropriate comment here, and begin script below
	if (g_form.isNewRecord())
		g_form.addInfoMessage(new GwtMessage().getMessage("To set up the User's password, save the record and then click Set Password."));   
}
