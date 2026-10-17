(function(context) {

	if (GlidePluginManager.isActive('com.sn.va.line')) {
        context.props_details.show_split_button = true;
		context.props_details.subtitle = '<p style=\'font-size:14px\'>'+ gs.getMessage('Integrate Line now. Learn more with a') + ' <a href=\'/api/now/v1/context_doc_url/va-line-integration\' target=\'_blank\' style=\'cursor:pointer;text-decoration:none;color:rgb(1, 119, 142);\'>' + gs.getMessage('step-by-step guide.') + '</a></p>';
    } else {
        context.props_details.show_button = true;
		context.props_details.link = CIPlugin.ConversationalIntegrationWithLine().getAppLink();
		context.props_details.subtitle = '<p style=\'font-size:14px\'>'+ gs.getMessage('Download the Line integration plugin. Learn more with a') + ' <a href=\'/api/now/v1/context_doc_url/va-line-integration\' target=\'_blank\' style=\'cursor:pointer;text-decoration:none;color:rgb(1, 119, 142);\'>' + gs.getMessage('step-by-step guide.') + '</a></p>';
	}
	context.props_details.channel_type = 'line';
})(context);
