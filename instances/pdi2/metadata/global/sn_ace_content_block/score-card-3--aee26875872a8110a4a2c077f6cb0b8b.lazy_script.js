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

	var total = global.AutoResolutionAPI.getCasesProcessedByIAR(pageParams.tableName, pageParams.numOfDays);
	var reviewed = global.AutoResolutionAPI.getCasesReviewedByUser(pageParams.tableName, pageParams.numOfDays);
	var reviewedPercentage = (total != 0) ? ((reviewed / total) * 100).toFixed() : 0;
	
    context.props_details = {
        // Need to get this data from apis
        'title': gs.getMessage('Solution reviewed by user'),
        'response': reviewedPercentage + "%",
        'tooltip_text': '',
        'desc': '‎ ',
    };

})(context);
