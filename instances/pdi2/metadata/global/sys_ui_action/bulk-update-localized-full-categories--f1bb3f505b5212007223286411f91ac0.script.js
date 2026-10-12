function translateFullCategoryForKnowledgeBase() {  
	var glideAjax = new GlideAjax("KBAjax");
	glideAjax.addParam("sysparm_type", "localizeCategoriesInKnowledgeBase");	
	glideAjax.addParam("sysparm_id", g_form.getUniqueValue());
	glideAjax.getXMLAnswer(function(answer) {
		var data = answer.evalJSON(true);
        if (!data.success) {
			g_form.addErrorMessage(data.message);
			return;
		}
            
		g_form.addInfoMessage(data.message);
	}.bind(this));
}
