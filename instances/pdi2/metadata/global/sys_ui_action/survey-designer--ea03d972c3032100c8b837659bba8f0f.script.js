function openNewSurvey() {
	if (g_form.modified) {
        alert(new GwtMessage().getMessage('You have unsaved changes. Please save them to continue.'));
	} else {
		var url = new GlideURL('$ng_sd.do');
		url.addParam('sysparm_stack', 'no');
		url.addParam('sysparm_survey', g_form.getUniqueValue());
		g_navigation.open(url.getURL(), 'survey_designer');
	}
}
