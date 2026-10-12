function onCondition() {
	var sectionNames = ['statistics', 'change_requestvalues'];
	for (var i = 0; i < sectionNames.length; i++) {
		if (g_form.isSectionVisible(sectionNames[i])) {
			g_form.setSectionDisplay(sectionNames[i], false);
		}
	}
	g_form.hideRelatedList("change_request");
}
