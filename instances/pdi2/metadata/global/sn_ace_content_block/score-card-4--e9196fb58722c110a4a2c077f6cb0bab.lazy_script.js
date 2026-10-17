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
	var closed = global.AutoResolutionAPI.getCasesResolvedByIAR(pageParams.tableName, pageParams.numOfDays);
	var closedPercentage = (total != 0) ? ((closed / total) * 100).toFixed() : 0;

    context.props_details = {
        'title': gs.getMessage('Cases closed by user'),
        'response': closedPercentage + '%',
        'tooltip_text': '',
        'desc': '‎ ',
    };

})(context);
