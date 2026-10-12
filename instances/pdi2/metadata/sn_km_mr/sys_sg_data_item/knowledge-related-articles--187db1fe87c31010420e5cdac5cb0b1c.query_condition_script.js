(function getQueryString(input) {
	var relatedArticles = new global.KBPortalServiceImpl().getRelatedArticles(input.max_related_articles,'short_description','', '',input.article_id, input.article_id, 'kb_2_kb', 'kb_knowledge', 'related_kb_knowledge');
	var articleIds = relatedArticles.map(function(article){
        return article.id;
    });
    return 'sys_idIN'+ new global.KBViewModel().getLatestArticles(articleIds, (input.translation_redirect === 'true')).join();
})(input);
