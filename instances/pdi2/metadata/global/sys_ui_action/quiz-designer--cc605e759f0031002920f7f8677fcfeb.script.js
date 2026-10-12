function openNewQuiz() {
	var url = new GlideURL('$ng_qd.do');
	url.addParam('sysparm_stack', 'no');
	g_navigation.open(url.getURL(), 'quiz_designer');
}
