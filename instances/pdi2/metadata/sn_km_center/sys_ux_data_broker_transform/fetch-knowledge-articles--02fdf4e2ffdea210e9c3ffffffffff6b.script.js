function transform(input) {
	var gr = new GlideRecordSecure('kb_knowledge');
	gr.addEncodedQuery(input.query);

	var showAuthor = (gs.getProperty('glide.knowman.search.show_author', 'false')) === 'true';
	var showArticle = (gs.getProperty('glide.knowman.search.show_article_number', 'false')) === 'true';
	var showViewCount = (gs.getProperty('glide.knowman.search.show_view_count', 'false')) === 'true';
	var showRating = (gs.getProperty('glide.knowman.search.show_rating', 'false')) === 'true';

	if (input.orderByDesc) {
		gr.orderByDesc(input.orderByField);
	} else {
		gr.orderBy(input.orderByField);
	}
	gr.setLimit(4);
	gr.query();

	var kbMod = new global.KBViewModel();
	var articles = [];
	while (gr.next()) {
		articles.push({
			number: kbMod.isVersioningEnabled() ? gr.getDisplayValue('display_number') : gr.getDisplayValue('number'),
            shortDescription: gr.getValue('short_description'),
			author: gr.getDisplayValue('author'),
			rating: gr.getValue('rating'),
			viewCount: gr.getDisplayValue('sys_view_count'),
			sysId: gr.getDisplayValue('sys_id')
		});
	}

	var agg = new GlideAggregate('kb_knowledge');
	agg.addEncodedQuery(input.query);
	agg.addAggregate('COUNT');
	agg.query();
	var totalArticles = 0;
	if (agg.next()) {
		totalArticles = agg.getAggregate('COUNT');
	}

	return {articles, props: {showAuthor, showArticle, showViewCount, showRating}, totalArticles: totalArticles};
}
