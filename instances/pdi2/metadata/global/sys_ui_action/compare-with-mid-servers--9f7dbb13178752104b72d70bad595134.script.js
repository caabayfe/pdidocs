function compareMids()  {
	var dialogClass = typeof GlideModal != 'undefined' ? GlideModal : GlideDialogWindow;
	var gdw = new dialogClass("mid_profile_validation_results");
	gdw.setTitle(getMessage("Compare Mid Servers With Profile"));
	gdw.setWidth("100%");
	gdw.setPreference("profile_number", g_form.getValue('number'));
	gdw.render();
}
