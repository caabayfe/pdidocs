function onCondition() {
	var sectionName = 'change_requestvalues';
	if (g_form.isSectionVisible(sectionName))
		g_form.setSectionDisplay(sectionName, false);
}
