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
	context.props_details = {
		table: context.pageParams.table,
		record_sysid: context.pageParams.sysId,
		query: context.pageParams.query
	};
})(context);
