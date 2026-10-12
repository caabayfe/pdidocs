var cxs_DefSearcherUtils = Class.create();
cxs_DefSearcherUtils.prototype = {

	initialize: function(contextConfig, gs) {
		this._contextConfig = contextConfig;
		this._gs = gs;
    },

	setSearcherDefault: function() {
		if (!this._contextConfig || this._contextConfig.cxs_searcher_config.nil())
			return false;
		
		var additionalResourceGr = this.getDefaultAdditionalResources();
		while (additionalResourceGr.next()) {
			additionalResourceGr.setValue("default_search", false);
			additionalResourceGr.update();
		}
	},
	
	isSearcherDefault: function() {
		if (!this._contextConfig || this._contextConfig.cxs_searcher_config.nil())
			return false;
		
		var additionalResourceGr = this.getDefaultAdditionalResources();
		if (additionalResourceGr.next())
			return false;
		
		return true;
	},
	
	getSearcherResources: function() {
		var searcherResource = new GlideRecord("cxs_search_res_config");
		
		if (this._contextConfig.cxs_searcher_config.nil())
			return searcherResource;
			
		searcherResource.addQuery("cxs_searcher_config", this._contextConfig.getValue("cxs_searcher_config"));
		searcherResource.orderBy("order");
		searcherResource.query();

		return searcherResource;
	},
	
	getDefaultAdditionalResources: function() {
		var additionalResourceGr = new GlideRecord("cxs_res_context_config");
		
		if (!this._contextConfig)
			return additionalResourceGr;
		
		additionalResourceGr.addQuery("cxs_context_config", this._contextConfig.getUniqueValue());
		additionalResourceGr.addQuery("default_search", true);
		additionalResourceGr.addActiveQuery();
		additionalResourceGr.query();
		return additionalResourceGr;
	},
	
    type: 'cxs_DefSearcherUtils'
};

cxs_DefSearcherUtils.getResourceChoices = function(searcherSysId) {	
	var fieldChoices = new GlideChoiceList();
	fieldChoices.add("all", gs.getMessage("All"));
	
	if (!searcherSysId)
		return fieldChoices;
	
	// Do not limit the selection to active resources.  Active checking will be done on query.
	var searcherResource = new GlideRecord("cxs_search_res_config");
	searcherResource.addQuery("cxs_searcher_config", searcherSysId);
	searcherResource.orderBy("order");
	searcherResource.query();
	
	while (searcherResource.next()){
		fieldChoices.add(searcherResource.getUniqueValue(), searcherResource.getDisplayValue("label"));
	}
	
	return fieldChoices;
};
