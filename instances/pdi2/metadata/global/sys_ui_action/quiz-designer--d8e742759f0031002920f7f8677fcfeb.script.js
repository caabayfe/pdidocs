function openQuiz() {
	var url = new GlideURL('$ng_qd.do');
	url.addParam('sysparm_stack', 'no');
	url.addParam('sysparm_quiz', rowSysId);
	g_navigation.open(url.getURL(), 'quiz_designer');
}
