(function() {
	data.articles = [];
	options.title = options.title || gs.getMessage("Top Rated Articles");
	
	var z;
	var knowledge_bases;
	var sys_id = $sp.getParameter('sys_id');
	var kb_id = $sp.getParameter('kb_id');
	var gr = new GlideRecord("kb_knowledge");
	data.sysId = sys_id;
	
	var foundArticle = false;
	if (sys_id) { // sys_id specified, try to find an article by sys_id or number
		gr.addQuery("sys_id", sys_id).addOrCondition("number", sys_id);
		gr.query();
		if (gr.next() && gr.canRead()) {
			// When sys_id matches a kb_record, get KB of the article
			knowledge_bases = String(gr.getValue('kb_knowledge_base'));
			foundArticle = true;
		}
	}
	
	if (!foundArticle) { /* For all other pages this code will get executed. Used on knowledge home page.*/
		/*If KB is selected display top rated articles only from that KB*/
		if (kb_id != null)
			knowledge_bases = String(kb_id);
		else {
			/*Get all knowledge bases associated with Portal*/
			knowledge_bases = String($sp.getKnowledgeBases());
		}
	}
	
	if (GlideStringUtil.notNil(knowledge_bases))
		z = $sp.getAllKBRecords(knowledge_bases);
	else //If there are no accessible KBs for logged in user
		return;
	
	z.addQuery("rating", ">", "0");
	if (options.kb_category)
		z.addQuery("kb_category", options.kb_category);
	z.orderByDesc('rating');
	z.setLimit(options.max_number || 5);
	z.query();
	while (z.next()) {
		if (!z.canRead())
			continue;

		var a = {};
		$sp.getRecordValues(a, z, 'short_description,sys_view_count,sys_id,published,rating');
		a.published_display = z.getDisplayValue("published");
		a.rating = Math.round(a.rating);
		a.ratingAriaLabel = gs.getMessage('Article, {0}, {1} star rating', [z.short_description, z.rating]);
		data.articles.push(a);
	}
})();
