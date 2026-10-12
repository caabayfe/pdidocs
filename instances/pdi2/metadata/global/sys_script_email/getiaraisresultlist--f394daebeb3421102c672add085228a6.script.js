(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
          /* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
          /* Optional GlideRecord */ event) {

	var recommendationsInfo = global.AutoResolutionAISearchHelper.getRecommendationInfoFromTaskId(current.sys_id);
	
	for (var i = 0; i < recommendationsInfo.length; i++) {

		if (recommendationsInfo[i].className == global.AutoResolutionConstants.CATALOG_TABLE_NAME)
			template.print("Catalog: " + recommendationsInfo[i].title + "<br />");
		else if (recommendationsInfo[i].className == global.AutoResolutionConstants.KNOWLEDGE_TABLE_NAME)
			template.print("KB: " + recommendationsInfo[i].title + "<br />");
			
	}

})(current, template, email, email_action, event);
