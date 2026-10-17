(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
/* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
/* Optional GlideRecord */ event) {
	
	// Modifying sender
	var sender = 'Service Map Planner System';
	var bestPractice = sender + " <do-not-reply@service-now.com>";
	email.setFrom(bestPractice);
	email.setReplyTo(bestPractice);
	
	var url = gs.getProperty('glide.servlet.uri')+'$sa_business_service.do?tab=BUSINESS_SERVICE_QUESTIONNAIRE_TAB&sysId=${business_service.sys_id}';
	
	template.print('<p>Hello,</p>');
	template.print('<p>You are requested to provide information necessary for mapping the business service ${business_service.name}.</p>');
	template.print('<p>Requested data description: ${description}</p>');
	template.print('<p><a title="Click here" href= ' + url +' target="_blank" rel="noopener noreferrer nofollow">Click here</a> and enter the requested data.</p>');
	template.print('<p>For more information on how to provide entry points for business services,<p>');
	template.print('refer to /api/now/v1/context_doc_url/CSHelp:AppServiceMapEntryPoints</p>');
	template.print('refer to <a title="App Service Map Entry Points" href="/api/now/v1/context_doc_url/CSHelp:AppServiceMapEntryPoints" target="_blank" rel="noopener noreferrer nofollow">App Service Map Entry Points</a>.</p>');

	template.print('<p>&nbsp;</p>');
	template.print('<p>Thanks,</p>');
	template.print('<p>' + sender + '</p>');
	
})(current, template, email, email_action, event);
