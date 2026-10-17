(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
          /* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
          /* Optional GlideRecord */ event) {
	if(event.parm1 && event.parm2){
		var recepient = event.parm1;
		var inputParams = JSON.parse(event.parm2);
		var date = new GlideDate();
		date.addMonths(1);
		var monthName = date.getByFormat("MMMM");
		var articleIDs = inputParams.articleList;
		if(articleIDs){
			var emailContent = new KBKnowledge().getArticleExpiryContent(recepient,inputParams);
			template.print(emailContent.templateContent);
			email.setSubject("Knowledge articles expiring in "+monthName);
		}	
	}
})(current, template, email, email_action, event);
