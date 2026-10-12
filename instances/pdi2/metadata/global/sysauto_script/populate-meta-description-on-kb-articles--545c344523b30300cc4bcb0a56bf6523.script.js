
if (pm.isActive('com.snc.knowledge_serviceportal')) {
	var seoMetaDescLength = parseInt(gs.getProperty('glide.knowman.seo.pages.meta_description.length',100));
	populateMetaDescriptionOnKBArticles();
}

function populateMetaDescriptionOnKBArticles() {

	var gr = new GlideRecord('kb_knowledge');
	gr.addQuery("workflow_state","published");
	gr.query();
	
	var count = 0, kbCount = gr.getRowCount(), glideSPScriptable = null, kbMod = null;
	gs.info("Populate Meta Description on KB Articles :: total published articles found: "+kbCount);

	if (kbCount > 0) {
		// populating meta desc only when any published articles are found
		glideSPScriptable = new GlideSPScriptable();
		kbMod = new global.KBViewModel();
		gr.setWorkflow(false); // no need to execute business rules on kb_knowledge
		
		while(gr.next()) {
			var metaDesc = getMetaDescription(gr);
			var oldValue = gr.getValue("meta_description");
			gr.setValue("meta_description",metaDesc);
			gr.setWorkflow(false); // no need to execute business rules on kb_knowledge

			if (oldValue != metaDesc && gr.update())
				count = count + 1;
		}
	}
	gs.info("Populate Meta Description on KB Articles :: total articles updated with meta description: "+count);
	
	function getMetaDescription(kb) {
		if (gs.nil(kb) || gs.nil(kb.sys_id))
			return "";

		var desc = "";
		var content = kbMod.getArticleContentForMetaDescription(kb);
		if (!gs.nil(content)) {
			content = glideSPScriptable.stripHTML(content) + "";
			if(!gs.nil(content)){
				desc = content.substring(0,seoMetaDescLength);
				desc = desc + content.substring(seoMetaDescLength).split(" ")[0];
			}
		}
		return desc;
	}
}
