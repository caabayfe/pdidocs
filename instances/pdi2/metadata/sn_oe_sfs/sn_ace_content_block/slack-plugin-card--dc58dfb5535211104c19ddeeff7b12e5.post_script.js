(function(context) {
	if (GlidePluginManager.isActive('com.sn.va.slack')) {
        context.props_details.show_split_button = true;
		context.props_details.subtitle = '<p style=\'font-size:14px\'>'+ gs.getMessage('Integrate Slack now. Learn more with a') + ' <a href=\'/api/now/v1/context_doc_url/va-slack-integration\' target=\'_blank\' style=\'cursor:pointer;text-decoration:none;color:rgb(1, 119, 142);\'>' + gs.getMessage('step-by-step guide.') + '</a></p>';
	} else {
        context.props_details.show_button = true;
		context.props_details.link = CIPlugin.CISlack().getAppLink();
		context.props_details.subtitle = '<p style=\'font-size:14px\'>'+ gs.getMessage('Download the Slack integration plugin. Learn more with a') + ' <a href=\'/api/now/v1/context_doc_url/va-slack-integration\' target=\'_blank\' style=\'cursor:pointer;text-decoration:none;color:rgb(1, 119, 142);\'>' + gs.getMessage('step-by-step guide.') + '</a></p>';
	} 
	context.props_details.channel_type = 'slack';
})(context);
