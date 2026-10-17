function onCondition() {
	if(g_scratchpad.isArticleTemplate){
		g_form.setDisplay('text', false);
		g_form.setDisplay('wiki', false);
		g_form.setDisplay('markdown', false);
		g_form.setDisplay('article_type', false);
	}
}
