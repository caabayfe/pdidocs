function onLoad() {
	if (g_form.getValue('ui_type') === 'workspace') {
		var sections = g_form.getSections();
		g_form.setSectionDisplay('when_todisplay', false);
		g_form.addInfoMessage(getMessage('Agent Assist Display Condition has been moved to Declarative Action Assignments'));
	}
}
