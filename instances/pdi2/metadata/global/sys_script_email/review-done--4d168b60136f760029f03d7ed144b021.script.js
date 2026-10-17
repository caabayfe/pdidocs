(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
          /* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
          /* Optional GlideRecord */ event) {

    var sender = 'Service Map Planner System';
	var bestPractice = sender + " <do-not-reply@service-now.com>";
	email.setFrom(bestPractice);
	email.setReplyTo(bestPractice);
	
	var url = gs.getProperty('glide.servlet.uri')+'$sa_business_service.do?tab=BUSINESS_SERVICE_REJECT_TAB&sysId=${business_service.sys_id}';
	
	template.print('<p>Hello,</p>');
	template.print('<p>The application service ${business_service.name} has been reviewed.<p>');
	template.print('<p><a title="Click here" href= ' + url +' target="_blank" rel="noopener noreferrer nofollow">Click here</a> to view the status.</p>');
	template.print('<p>For more information about fixing individual application services,<p>');
	template.print('refer <a title="Tune Application Service Map" href="/api/now/v1/context_doc_url/CSHelp:TuneBusinessServiceMap" target="_blank" rel="noopener noreferrer nofollow">Tune Application Service Map</a>.</p>');

	template.print('<p>&nbsp;</p>');
	template.print('<p>Thanks,</p>');
	template.print('<p>' + sender + '</p>');

})(current, template, email, email_action, event);
