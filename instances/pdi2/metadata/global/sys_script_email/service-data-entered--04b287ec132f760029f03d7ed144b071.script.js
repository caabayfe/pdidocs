(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
          /* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
          /* Optional GlideRecord */ event) {
         
	var sender = 'Service Map Planner System';
	var bestPractice = sender + " <do-not-reply@service-now.com>";
	email.setFrom(bestPractice);
	email.setReplyTo(bestPractice);
	
	var url = gs.getProperty('glide.servlet.uri')+'$sa_business_service.do?tab=BUSINESS_SERVICE_QUESTIONNAIRE_TAB&sysId=${business_service.sys_id}';
	
	template.print('<p>Hello,</p>');
	template.print('<p>The data you requested for the application service ${business_service.name} is available in the link bellow.</p>');
	template.print('<p><a title="Click here" href= ' + url +' target="_blank" rel="noopener noreferrer nofollow">Click here</a></p>');
	template.print('<p>For more information about mapping individual application services,<p>');
	template.print('refer to <a title="Define New Application Service" href="/api/now/v1/context_doc_url/CSHelp:SM-DefineNewBusinessService" target="_blank" rel="noopener noreferrer nofollow">Define New Application Service</a>.</p>');

	template.print('<p>&nbsp;</p>');
	template.print('<p>Thanks,</p>');
	template.print('<p>' + sender + '</p>');

})(current, template, email, email_action, event);
