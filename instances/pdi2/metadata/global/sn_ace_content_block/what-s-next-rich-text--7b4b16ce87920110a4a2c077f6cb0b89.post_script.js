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
	if (!GlidePluginManager.isActive("sn_itsm_va") && !GlidePluginManager.isActive("sn_iar_hr")) {
		context.props_details.vars = '{"title":"Here’s what to expect"}';
	}
	
})(context);
