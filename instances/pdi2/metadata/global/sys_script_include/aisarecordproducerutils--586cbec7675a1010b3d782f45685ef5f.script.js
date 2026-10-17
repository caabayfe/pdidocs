var AISARecordProducerUtils = Class.create();
AISARecordProducerUtils.prototype = {
	_AISA_RP_CONFIG: "aisa_rp_config",
	_CXS_RP_CONFIG: "cxs_rp_config",
	_AIS_SEARCH_PROFILE: "ais_search_profile",
	_SEARCH_CONTEXT_CONFIG: "sys_search_context_config",
	_PUBLISHED_STATE: "PUBLISHED",
	_SEARCHABLE_TYPES: ["2", "6", "16"],
	_MESP_PORTAL_SYS_ID: "26f2fffb77322300454792718a1061e5",
	_MOBILE_GLOBAL_SEARCH_CONFIG_SYS_ID: "d259d3d47320330018eea18d4ef6a708",

    initialize: function() {
    },

	isRPConfigExistingOnRP: function(sys_id) {
		var rpConfigGr = new GlideRecord(this._AISA_RP_CONFIG);
		rpConfigGr.addQuery('sc_cat_item', sys_id);
		rpConfigGr.addActiveQuery();
		rpConfigGr.query();
		return rpConfigGr.hasNext();
	},

	getRPConfigByRPId: function(rpSysId) {
		var rpConfigGr = new GlideRecord(this._AISA_RP_CONFIG);
		rpConfigGr.addQuery('sc_cat_item', rpSysId);
		rpConfigGr.addActiveQuery();
		rpConfigGr.query();
		if (!rpConfigGr.next())
			return null;

		var searchSourceTableMap = {};
		var searchSourceM2MGr = new GlideRecord('ais_search_profile_ais_search_source_m2m');
		searchSourceM2MGr.addQuery('profile', rpConfigGr.search_app.search_profile + '');
		searchSourceM2MGr.query();
		while (searchSourceM2MGr.next()) {
			var searchSourceGr = new GlideRecord('ais_search_source');
			if (searchSourceGr.get(searchSourceM2MGr.getValue('search_source')))
				searchSourceTableMap[searchSourceGr.getUniqueValue()] = searchSourceGr.datasource.source + '';
		}
		
		return {
			appId: rpConfigGr.search_app.application_id + '',
			searchApp: rpConfigGr.getValue("search_app"),
			searchProfile: rpConfigGr.search_app.search_profile + '',
			headerText: rpConfigGr.getDisplayValue("header_text"),
			searchVariable: rpConfigGr.getValue("search_variable"),
			resultsPerPage: parseInt(rpConfigGr.getValue("results_per_page")),
			allowExpandCollapse: !!rpConfigGr.allow_expand_collapse,
			searchSourceTableMap: searchSourceTableMap
		};
	},
	
    getVariableIds: function(gr) {
        var sysIds = [];

        if (!gr)
            return sysIds;

        var variableGr = new GlideRecord("item_option_new");
        variableGr.addQuery("sys_id", "IN", this.getCatItemVariableIds(gr));
        variableGr.query();

        while (variableGr.next())
            sysIds.push(variableGr.getUniqueValue());

        return sysIds;
    },

    getCatItemVariableIds: function(gr) {
        var sysIds = [];

        if (!gr)
            return sysIds;

        var catItemId = gr.getValue("sc_cat_item");
		var catItemGr = new GlideRecord("sc_cat_item");
        if (!catItemGr.get(catItemId))
            return sysIds;

        var catItemObj = GlideappCatalogItem.get(catItemId);
        var varsGr = catItemObj.getStandaloneVariables();
        while (varsGr.next())
            if (this._SEARCHABLE_TYPES.indexOf(varsGr.type + "") >= 0)
                sysIds.push(varsGr.getUniqueValue());

        return sysIds;
    },
	
	getRPVariable: function(gr) {
		var varGr = new GlideRecord("item_option_new");
		varGr.addQuery("cat_item", gr.sc_cat_item);
		varGr.addQuery("name", "ai_search_assist");
		varGr.query();
	
		return (varGr.next() ? varGr : null);
	},

	addToRecordProducer: function(gr) {
        if (this.getRPVariable(gr))
            return false;
    
        var maxVarOrderGa = new GlideAggregate("item_option_new");
        maxVarOrderGa.addQuery("cat_item", gr.sc_cat_item);
        maxVarOrderGa.addAggregate("MAX", "order");
        maxVarOrderGa.groupBy("cat_item");
        maxVarOrderGa.query();

        var order = 100;
        if (maxVarOrderGa.next())
            order = (maxVarOrderGa.getAggregate("MAX", "order") - 0) + 100;

        var varGr = new GlideRecord("item_option_new");
        varGr.type = 14; // Macro;
		varGr.sp_widget = "66135172671e1010b3d782f45685ef9e";
        varGr.cat_item = gr.sc_cat_item;
        varGr.display_title = false;
        varGr.question_text = "AI Search Assist";
        varGr.name = "ai_search_assist";
        varGr.order = order;
        varGr.insert();

        return true;
    },
	
	removeFromRecordProducer: function(aisaRPConfig) {
		var aisaRecProdConfigs = new GlideRecord(this._AISA_RP_CONFIG);
		aisaRecProdConfigs.addQuery("cat_item", aisaRPConfig.sc_cat_item);
		aisaRecProdConfigs.addQuery("sys_id", "!=", aisaRPConfig.getUniqueValue());
		aisaRecProdConfigs.query();
		if (aisaRecProdConfigs.next()) 
			return false; // do not delete the variable if there are other aisa record producer configs for that record producer
		
		var rpVar = this.getRPVariable(aisaRPConfig);
		if (!rpVar)
			return false;
		
        return rpVar.deleteRecord();
    },
	
	useAISARecordProducerConfig: function(catItemId) {
		if (!catItemId) {
			return false;
		}
		
		var aisaRPConfig = new GlideRecord(this._AISA_RP_CONFIG);
		aisaRPConfig.get("sc_cat_item", catItemId);

		var useAISA = false;
		if (aisaRPConfig.isValidRecord()) {
			var isActive = !!aisaRPConfig.active;
			var isPublished = false;
			
			var searchProfileSysID = aisaRPConfig.search_app.search_profile;
			var searchProfile = new GlideRecord(this._AIS_SEARCH_PROFILE);
			if (searchProfileSysID && searchProfile.get(searchProfileSysID)) {
				isPublished = (!!searchProfile.active && (searchProfile.state == this._PUBLISHED_STATE));
			}
			
			useAISA = isActive && isPublished;
		}

		return useAISA;
	},
	
	isMesp: function(portalSysId) {
		// check if the accessed portal is Mobile Employee Service Portal
		return (portalSysId == this._MESP_PORTAL_SYS_ID);
	},
	
	getNowMobileSearchEngine: function() {
		var searchEngine = '';
		
		var mobileSearchConfig = new GlideRecord('sys_sg_global_search');
		if (mobileSearchConfig.get(this._MOBILE_GLOBAL_SEARCH_CONFIG_SYS_ID)) {
			// Access the Search Application to return the Search Engine type
			var searchContextConfig = mobileSearchConfig.search_context_config;
			if (searchContextConfig)
				searchEngine = searchContextConfig.search_engine;
		}
		
		return searchEngine;
	},

	checkForDuplicateRPC: function(rpcRecord) {
		if (!rpcRecord)
			return false;
		var config = new GlideRecord(this._AISA_RP_CONFIG);
		config.addQuery("sc_cat_item", rpcRecord.getValue("sc_cat_item"));
		config.addQuery("sys_id", "!=", rpcRecord.getUniqueValue());
		/* only use "setLimit" if process separation is disabled for domains - there's potential for a query with setLimit to return no data due to overriden records being removed from the query results */
		if (!GlideDomainSupport.isProcessSeparationEnabled())
			config.setLimit(1);

		config.query();
		return config.hasNext();
	},

    type: 'AISARecordProducerUtils'
};
