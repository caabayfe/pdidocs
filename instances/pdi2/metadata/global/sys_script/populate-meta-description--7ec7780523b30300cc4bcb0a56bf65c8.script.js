(function executeRule(current, previous /*null when async*/) {
	
	var desc = "";
	var kbMod = new global.KBViewModel();
	var content = kbMod.getArticleContentForMetaDescription(current);
	if (!gs.nil(content)) {
		content = new GlideSPScriptable().stripHTML(content) + "";
		if(!gs.nil(content)) {
			var seoMetaDescLength = parseInt(gs.getProperty('glide.knowman.seo.pages.meta_description.length',100));
			desc = content.substring(0,seoMetaDescLength);
			desc = desc + content.substring(seoMetaDescLength).split(" ")[0];
		}
	} 
	var article = new GlideRecord(current.sys_class_name);
	if(article.get(current.sys_id)) {
		article.setWorkflow(false); // no need to execute business rules on kb_knowledge
		article.setSystem(true);
		article.meta_description = desc;
		article.update();
	}
	
})(current, previous);
