function openNewSurvey() {
	var url = new GlideURL('$ng_sd.do');
	url.addParam('sysparm_stack', 'no');
	g_navigation.open(url.getURL(), 'survey_designer');
}
