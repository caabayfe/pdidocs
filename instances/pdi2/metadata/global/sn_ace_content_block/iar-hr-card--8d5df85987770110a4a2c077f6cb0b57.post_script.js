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
	paragraph_open = "<p style='font-family: `Open Sans`;font-style: normal;font-weight: 400;font-size: 12px;'>";
	paragraph_end = "</p>";
	if(GlidePluginManager.isActive('sn_iar_hr')) {
		context.subtitle = gs.getMessage('Set up Issue Auto Resolution for HR');
		context.props_details.rich_text = paragraph_open + gs.getMessage("Quick start your HR Issue Auto Resolution journey by activating the IAR Configuration for one or more COE. Click Setup to get started.") + "<br><br><br><a href='https://store.servicenow.com/sn_appstore_store.do#!/store/application/3eefb89bdc38cd50f87747162048c37b/' target='_blank' style='text-decoration: none'>" + gs.getMessage("Learn more") + "</a><br>" + paragraph_end;
	}
	else {
		context.subtitle = gs.getMessage('Install Issue Auto Resolution for HR');
		context.props_details.rich_text = paragraph_open + gs.getMessage("Quick start your HR Issue Auto Resolution journey by activating the IAR Configuration for one or more COE. Click Install to get started.") + "<br><br><br><a href='https://store.servicenow.com/sn_appstore_store.do#!/store/application/3eefb89bdc38cd50f87747162048c37b/' style='text-decoration: none'>" + gs.getMessage("Learn more") + "</a><br>" + paragraph_end;
	}
	
	context.props_details.image = '/images/IAR_HR.png';
	
})(context);
