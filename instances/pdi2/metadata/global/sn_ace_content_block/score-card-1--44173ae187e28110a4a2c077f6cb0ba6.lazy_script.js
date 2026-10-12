(function(context) {
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
	
	var pageParams = {
		"tableName": gs.getUser().getPreference("iar.table_name"),
		"numOfDays": gs.getUser().getPreference("iar.num_of_days")
	};
	
    context.props_details = {
        // Need to get this data from apis
        'title': gs.getMessage('Total cases processed'),
        'response': global.AutoResolutionAPI.getCasesProcessedByIAR(pageParams.tableName, pageParams.numOfDays),
        'tooltip_text': '‎',
        'desc': '‎ ',
    };

})(context);
