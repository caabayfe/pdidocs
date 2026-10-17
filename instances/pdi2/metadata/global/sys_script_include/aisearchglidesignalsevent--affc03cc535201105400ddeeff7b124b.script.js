var AISearchGlideSignalsEvent = Class.create();

AISearchGlideSignalsEvent.prototype = {
	
	payload: null,
	searchResultMetadata:null,
	
	initialize: function(searchResultMetadata, paramBag) {
		
		this.payload = {};
		this.searchResultMetadata = searchResultMetadata;
		
		this.setValue(global.AISearchConstants.USER_ID, paramBag[global.AISearchConstants.USER_ID]);
		this.setValue(global.AISearchConstants.SESSION_ID, paramBag[global.AISearchConstants.SESSION_ID]);
		
		this.setValue(global.AISearchConstants.APPLICATION_ID, global.AISearchConstants.APPLICATION_ID_GLOBAL);
		this.setValue(global.AISearchConstants.APPLICATION_TYPE, global.AISearchConstants.APPLICATION_TYPE_AI_SEARCH);
		
		this.setValue(global.AISearchConstants.SEARCH_PROFILE, paramBag[global.AISearchConstants.SEARCH_PROFILE]);
		this.setValue(global.AISearchConstants.SEARCH_CONTEXT_CONFIG_ID, paramBag[global.AISearchConstants.SEARCH_CONTEXT_CONFIG_ID]);
		
		this.setValue(global.AISearchConstants.QUERY_TERM, this.getQueryTerm(paramBag));
	},
	
	getQueryTerm : function(paramBag) {
		
		var searchTerm 
			= !gs.nil(this.searchResultMetadata.correctedSearchTerm) ? 
				this.searchResultMetadata.correctedSearchTerm : this.searchResultMetadata.searchTerm;
		
		// if not found, try to read it from the paramBag
		if (gs.nil(searchTerm) && !gs.nil(paramBag[global.AISearchConstants.QUERY_TERM]))
			searchTerm = paramBag[global.AISearchConstants.QUERY_TERM];
		
		return searchTerm;
	},
	
	getEventType: function() {
		throw 'Need to implement';
	},
	
	getSearchResultMetadata: function() {
		return this.searchResultMetadata;
	},
	
	getPayload: function() {
		if (gs.nil(this.payload))
			this.payload = {};
		return this.payload;
	},
	
	setValue: function(name ,val) {
		this.getPayload()[name] = gs.nil(val)? '': val+'';
	},
	
	getResultSysId: function(model) {
		return global.AISearchHelper.getResourceIdFromModel(model);
	},
	
	getSourceTable: function(model) {
		return global.AISearchHelper.getResourceTableFromModel(model);
	},
	
	getAISDocId: function(srcTable, resultSysId) {
		return global.AISearchHelper.getAISDocId(srcTable, resultSysId);
	},

	getDataSourceTitle: function(srcTable) {
		return global.AISearchHelper.getDataSourceTitle(srcTable);
	},
	
	type: 'AISearchGlideSignalsEvent'
};
