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
	context.props_details.iar_tables = [];
	context.isRoot = true;
	var gr = new GlideRecord("sys_cs_auto_resolution_configuration");
    gr.query();
    while (gr.next()) {
        var tableName = gr.getValue("target_table_name");
        var nowGr = new GlideRecord(tableName);
        context.props_details.iar_tables.push({
            "id": gr.getValue("target_table_name"),
            "label": nowGr.getClassDisplayValue(),
			"sys_id": gr.getValue("sys_id")
        });
    }
	
})(context);
