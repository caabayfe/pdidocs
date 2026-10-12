var RASearchSourcesTableChoices = Class.create();
RASearchSourcesTableChoices.prototype = {
    initialize: function() {
    },
	process: function(tableName) {
		var gr= new GlideRecord(Constants.TBL_SEARCH_FILTER);
	  gr.addQuery(Constants.COL_SEARCH_CONTEXT_CONFIG, current.context.search_application_configuration);
	  gr.query();
		answer=new Array();
		answer.push("");
		while(gr.next())
			answer.push(gr.ais_search_source.datasource.source+"");
		return answer;
	},

    type: 'RASearchSourcesTableChoices'
};
