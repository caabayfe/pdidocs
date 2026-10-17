(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
/* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
/* Optional GlideRecord */ event) {
	
	// Modifying sender
	var sender = 'Service Map Planner System';
	var bestPractice = sender + " <do-not-reply@service-now.com>";
	email.setFrom(bestPractice);
	email.setReplyTo(bestPractice);
	
	var serviceName="";
	var serviceId = current.business_service;
	var serviceGr = new GlideRecord("cmdb_ci_service_discovered");
	serviceGr.addQuery("sys_id", serviceId);
	serviceGr.query();
	if (serviceGr.next()) {
		serviceName = serviceGr.name;
	}
	var url = gs.getProperty('glide.servlet.uri')+'$sw_topology_map.do?sysparm_bsid=${business_service.sys_id}&sysparm_bsname='+encodeURIComponent(serviceName)+'&sysparm_plugin_mode=mapping';
	
	template.print('<p>Hello,</p>');
	template.print('<p>You are requested to review service ${business_service.name} to verify that it is correct and complete. .</p>');
	template.print('<p>Review description: ${description}</p>');
	template.print('<p><a title="Click here" href= ' + url +' target="_blank" rel="noopener noreferrer nofollow">Click here</a> to access the map for this business service.</p>');
	template.print('<p>For more information about the review and approval process,<p>');
	template.print('refer to <a title="Review App Service Maps" href="/api/now/v1/context_doc_url/CSHelp:ReviewAppServiceMaps" target="_blank" rel="noopener noreferrer nofollow">Review App Service Maps</a>.</p>');

	template.print('<p>&nbsp;</p>');
	template.print('<p>Thanks,</p>');
	template.print('<p>' + sender + '</p>');
	
})(current, template, email, email_action, event);
