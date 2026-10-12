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
	var identified = global.AutoResolutionAPI.getDeflectableCases(pageParams.tableName, pageParams.numOfDays);
	var identifiedPercentage = (total != 0) ? ((identified / total) * 100).toFixed() : 0;

	var topics = global.AutoResolutionAPI.getCasesWithMatchedIntents(pageParams.tableName, pageParams.numOfDays);
	var topicsPercentage = (identified != 0) ? ((topics / identified) * 100).toFixed() : 0;

	var aiSearch = global.AutoResolutionAPI.getCasesWithMatchedSearchResults(pageParams.tableName, pageParams.numOfDays);
	var aiSearchPercentage = (identified != 0) ? ((aiSearch / identified) * 100).toFixed() : 0;

	var params = [];
	params.push(topicsPercentage);
	params.push(aiSearchPercentage);

    context.props_details = {
        // Need to get this data from apis
        'title': gs.getMessage('Solution identified by IAR'),
        'response': identifiedPercentage + '%',
        'tooltip_text': '',
		'desc': gs.getMessage('{0}% via Topics, {1}% via AI Search', params)
    };

})(context);
