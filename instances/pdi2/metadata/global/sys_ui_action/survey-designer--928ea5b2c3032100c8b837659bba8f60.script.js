function openSurvey() {
	var url = new GlideURL('$ng_sd.do');
	url.addParam('sysparm_stack', 'no');
	url.addParam('sysparm_survey', rowSysId);
	g_navigation.open(url.getURL(), 'survey_designer');
}
