(function(context){
	/*
		context = {
			'block_id': @sysId,
			'name': @String,
			'title': @String,
			'subtitle': @String,
			'order': @Number,
			'type': @Object,
			'children': @Array[context],
			'props_details': @Object
		};
	*/
	//put your code here
	if(GlidePluginManager.isActive('sn_itsm_va')) {
		context.subtitle = gs.getMessage('Set up ITSM Virtual Agent Conversations');
	}
	else {
		context.subtitle = gs.getMessage('Install ITSM Virtual Agent Conversations');
	}
	paragraph_open = "<p style='font-family: `Open Sans`;font-style: normal;font-weight: 400;font-size: 12px;'>";
	paragraph_end = "</p>";
	context.props_details.rich_text = paragraph_open + gs.getMessage("Display the following description on the card - Purpose-built IT service management conversations to help your organisation quickly deploy automated self-service experiences.") + "<br><br><a href='https://store.servicenow.com/sn_appstore_store.do#!/store/application/134450a0b3781300787162ac16a8dc1e/' target='_blank' style='text-decoration: none'>" + gs.getMessage("Learn more") + "</a><br>" + paragraph_end;
	context.props_details.image = '/images/ITSM.png';
	
})(context);
