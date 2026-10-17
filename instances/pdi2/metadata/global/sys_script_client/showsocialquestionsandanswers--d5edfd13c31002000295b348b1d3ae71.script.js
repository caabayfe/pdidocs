function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading) {
		return;
	}
	else {
		if (newValue == "true") {
			g_form.showFieldMsg('enable_socialqa',getMessage('Social Q&A questions will be visible when you search or browse this knowledge base'),'info');
			g_form.showRelatedList('REL:c4239280473002007f47563dbb9a719e');
		}
		else {
			g_form.hideFieldMsg('enable_socialqa');
			g_form.hideRelatedList('REL:c4239280473002007f47563dbb9a719e');
		}
	}
}
