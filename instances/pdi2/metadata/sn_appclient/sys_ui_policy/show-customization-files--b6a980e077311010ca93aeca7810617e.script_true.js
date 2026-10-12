function onCondition() {
	if (g_scratchpad.isAppCustomizationCapable) {
		g_form.showRelatedList('REL:20be43c477791010ca93aeca78106113');
		g_form.setSectionDisplay("application_customization", true);
	} else {
		g_form.hideRelatedList('REL:20be43c477791010ca93aeca78106113');
		g_form.setSectionDisplay("application_customization", false);
	}
}
