(function() {
	data.isvalid = false;
	var id = $sp.getParameter('sys_id') || $sp.getParameter('sys_kb_id') || $sp.getParameter('sysparm_article');
	var gr = GlideRecord("kb_knowledge");
	gr.addQuery("sys_id", id).addOrCondition("number", id);
	gr.query();
	if (!gr.next())
		return;

	var articleGR = gr;

	// If article is loaded using sys_id, we will always get correct category.
	// If article is loaded using KB number (sysparm_article), we may get incorrect category when
	// different versions of the article belongs to different categories since
	// same KB number is used for different versions of the article
	if (id != articleGR.sys_id) {
		// Page is not loaded using sys_id. Hence try to fetch the latest version of the article.
		var kbViewModel = new global.KBViewModel();
		kbViewModel.getInfoForSP({sysparm_article : articleGR.getValue('number')});
		if (kbViewModel.knowledgeRecord)
			articleGR = kbViewModel.knowledgeRecord;
	}

	var kbu = new KBKnowledgeSNC();
	if (!kbu.canRead(articleGR))
		return;

	if (articleGR.kb_category.nil())
		return;

	data.isvalid = true;
	data.category = articleGR.getDisplayValue('kb_category');
	data.category_id = articleGR.getValue('kb_category');
	data.alsoInMsg = gs.getMessage("Also in {0}", data.category);

	data.articles = [];
	var z = new GlideRecord('kb_knowledge');
	z.addQuery("sys_class_name", "!=", "kb_knowledge_block");
	z.addQuery('kb_category', data.category_id);
	z.addQuery('workflow_state', 'published');
	z.addQuery('valid_to', '>=', (new GlideDate()).getLocalDate().getValue());
	z.orderByDesc('sys_view_count');
	z.query();
	data.count = z.getRowCount();
	var count = 0;
	while (z.next() && count < 5) {
		if (z.sys_id == articleGR.sys_id)
			continue;

		if (!z.canRead())
			continue;

		count++;
		var a = {};
		$sp.getRecordValues(a, z, 'sys_id,short_description,sys_view_count')
		a.published = z.getDisplayValue('published');
		data.articles.push(a);
	}
})();
