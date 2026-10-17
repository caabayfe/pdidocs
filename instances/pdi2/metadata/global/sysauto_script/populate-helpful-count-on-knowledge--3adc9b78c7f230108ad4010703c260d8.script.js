populateHelpfulCount();
function populateHelpfulCount() {
	try{
		var propVal = gs.getProperty("glide.knowman.count_helpful_feedback",false)+'';
		if(!gs.nil(propVal) && propVal == 'false'){
			updateHelpfulProperty(true);
		}
		
		var isVersioningInstalled = GlidePluginManager.isActive("com.snc.knowledge_advanced");
		var columnToGroup = 'article';
		if(isVersioningInstalled)	
			columnToGroup = 'article_summary';
		var ga = new GlideAggregate('kb_feedback');
		ga.addQuery('useful', 'yes');	
		ga.addQuery('article.sys_class_name','!=', 'kb_knowledge_block');
		ga.addNotNullQuery(columnToGroup);
		ga.addAggregate('count', 'useful');	
		ga.groupBy(columnToGroup);	
		ga.setCategory('list');
		ga.query();
		while(ga.next()){
			updateArticleWithHelpfulCount(isVersioningInstalled,ga.getValue(columnToGroup),ga.getAggregate('count', 'useful'));
		}
	}catch(e){
		gs.error("Failed to populate helpful count on knowledge" + e);
	}finally{
		updateHelpfulProperty(false);
	}
}

function updateHelpfulProperty(val){
	var gr = new GlideRecord("sys_properties");
	gr.addQuery('name','glide.knowman.count_helpful_feedback');
	gr.query();
	if(gr.next()){
		gr.setValue('value',val);
		gr.update();
	}
}

function updateArticleWithHelpfulCount(isVersioningInstalled,id,count){
	try{
		var gmu = new GlideMultipleUpdate("kb_knowledge");
		if(isVersioningInstalled)
			gmu.addQuery('summary',id);
		else
			gmu.addQuery('sys_id',id);
		gmu.setIncrement('helpful_count',count);
		gmu.execute();
	}catch(e){
		gs.error("Failed to populate helpful count for id : " + id + " exception :" + e);
	}
} 		
