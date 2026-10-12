(function() {
	var t = data;
	t.isvalid = false;
	
	var articleGR = new GlideRecord("kb_knowledge");
	var id = $sp.getParameter("sys_id") || $sp.getParameter("sys_kb_id") || $sp.getParameter('sysparm_article');
	articleGR.addQuery("sys_id", id).addOrCondition("number", id);
	articleGR.query();
	if (!articleGR.next())
		return;
	
	if (!articleGR.canRead())
		return;
	
	t.isvalid = true;
	
  // update sys_view_count on kb_knowledge record
	var asyncUpdate = gs.getProperty('glide.knowman.async_view_update', 'false');
	if (!asyncUpdate || asyncUpdate === 'false')
		articleGR.incrementViewCount();
	else
		gs.eventQueue("knowledge.view", articleGR, null, null, "knowledge_view_queue");

	var art = new GlideRecord("kb_use");
	if (art.isValid()) {
		art.article = articleGR.getUniqueValue();
		art.user = gs.getUserID();
		art.viewed = true;
		art.insert(); // kb_use records are aggregated to update sys_view_count nightly
		$sp.logStat('KB Article View', "kb_knowledge", articleGR.getUniqueValue(), articleGR.short_description);
	}

	t.category = articleGR.getValue('kb_category');
	t.sys_id = articleGR.getUniqueValue();
	t.table = articleGR.getRecordClassName();
	t.showAttachments = false;
	if (articleGR.display_attachments)
		t.showAttachments = true;
	t.categoryDisplay = articleGR.getDisplayValue('kb_category');
	t.short_description = articleGR.getValue('short_description');
	t.text = new global.KBViewModel().getArticleContentBySysId(articleGR.getUniqueValue());
	t.articleType = articleGR.getValue('article_type');
	
	// Next line bumps the view count for display, but does not update the kb_knowledge
	// record. The articleGR.incrementViewCount() line above already did that, but we
	// don't want to re-fetch the GlideRecord
	articleGR.sys_view_count = articleGR.sys_view_count + 1;
	
	t.sys_view_count = articleGR.getDisplayValue('sys_view_count');
	t.sys_view_countValue = articleGR.getValue('sys_view_count');
	t.author = articleGR.getDisplayValue('author');
	t.publishedUtc = articleGR.getValue('published');
	t.number = articleGR.getValue('number');
	if (showStarRating())
		t.rating = articleGR.getValue('rating');
	t.direct = false;
	if (articleGR.direct)
		t.direct = true;
  
	//get KB name of the article
	data.kbId = [articleGR.getValue('kb_knowledge_base')];
	data.kbName = articleGR.getDisplayValue('kb_knowledge_base');
	
	t.breadcrumbs = [{label: t.short_description, url: '#'}];
	if (!articleGR.kb_category.nil()) {
		var rec = articleGR.kb_category.getRefRecord();
		while (rec.getRecordClassName() == "kb_category") {
			t.breadcrumbs.unshift({label: rec.getDisplayValue(), url: '?id=kb_category&kb_category=' + rec.getUniqueValue() + '&kb_id='+ data.kbId});
			rec = rec.parent_id.getRefRecord();
		}
	}
	
	var kbs = $sp.getKnowledgeBases();
	var countOfKb= kbs.split(',').length;
	
	data.kb_knowledge_page = $sp.getDisplayValue("kb_knowledge_page") || "kb_view";
	if (countOfKb > 1) {
		if (GlideStringUtil.notNil(data.kbName))
			t.breadcrumbs.unshift({label: data.kbName, url: '?id=' + data.kb_knowledge_page + '&kb_id='+ data.kbId});
		t.breadcrumbs.unshift({label: gs.getMessage("All Knowledge Bases"), url: '?id=' + t.kb_knowledge_page});
	} else
		t.breadcrumbs.unshift({label: gs.getMessage("Knowledge Base"), url: '?id=' + t.kb_knowledge_page});
	
	if (global.KBVersioning) {
		var latestAccessibleVersionGR = new global.KBVersioning().getLatestAccessibleVersion(t.number);
		var newerVersionID = latestAccessibleVersionGR.getUniqueValue();
		if (newerVersionID != t.sys_id)
			data.newerVersionID = newerVersionID;
	}
})();
		
function showStarRating() {
	if (options.show_star_rating == "Yes")
		return true;

	if (options.show_star_rating == "No")
		return false;

	// check gating property for all rating options
	if (gs.getProperty("glide.knowman.show_rating_options", "true") != "true")
		return false;

	// does user have the right role?
	if (!gs.hasRole(gs.getProperty("glide.knowman.show_rating_options.roles")))
		return false;

	// check specific property for stars
	if (gs.getProperty("glide.knowman.show_star_rating", "true") != "true")
		return false;

	// does user have the right role?
	return gs.hasRole(gs.getProperty("glide.knowman.show_star_rating.roles"));
}
