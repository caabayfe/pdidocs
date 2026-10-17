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
	context.title = gs.getMessage("Auto Resolution Configuration");
    context.subtitle = gs.getMessage("Review the current settings");
	context.props_details.status = gs.getProperty("com.glide.cs.enable_auto_resolution")=="true"? true:false;
	context.props_details.aria_label = {"aria-label":"Auto Resolution Configuration"};

	
})(context);
