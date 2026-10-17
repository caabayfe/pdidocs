(function() {
    if (!input) {
		var rpUtils = new AISARecordProducerUtils();
		var actionUtils = new AISAActionUtils();
		var rpSysId = options.cat_item || $sp.getParameter("sys_id");
		var aisaEnabled = rpUtils.useAISARecordProducerConfig(rpSysId);
		var portalPage = $sp.getPortalRecord();
		var user = new GlideRecord('sys_user');
		user.get(gs.getUserID());

		var aisPortalEnabled = portalPage && !!portalPage.enable_ais;
		var isMesp = rpUtils.isMesp(portalPage.getUniqueValue());
		if (isMesp)
			aisPortalEnabled = portalPage && (rpUtils.getNowMobileSearchEngine() == 'ai_search');
		
		data.useAISA = aisaEnabled && aisPortalEnabled;
		data.rpSysId = rpSysId;
		data.isLocationTrackerDisabled = (gs.getProperty('glide.service_portal.disable_location_tracker') == "true") || false;
		data.session = {
			userId: gs.getUserID(),
			language: gs.getSession().getLanguage(),
			domain: (GlidePluginManager.isActive('com.glide.domain') && user.isValidRecord() ? user.getDisplayValue('company') : '')
		};

		data.rpConfig = rpUtils.getRPConfigByRPId(rpSysId);

		if (!GlidePluginManager.isActive('com.glide.domain'))
			data.aisaProperties = {
				wait_time: parseInt(gs.getProperty('com.snc.ai_search_assist.wait_time', 500)),
				min_length: parseInt(gs.getProperty('com.snc.ai_search_assist.min_length', 3))
			};
		else
			data.aisaProperties = {
				wait_time: parseInt(GlideApplicationProperty.getValue('com.snc.ai_search_assist.wait_time')),
				min_length: parseInt(GlideApplicationProperty.getValue('com.snc.ai_search_assist.min_length'))
			};
		
		data.kbProperties = {
			show_author: (gs.getProperty("glide.knowman.search.show_author", false) == "true") || false,
			show_article_number: (gs.getProperty("glide.knowman.search.show_article_number", false) == "true") || false,
			show_category: (gs.getProperty("glide.knowman.search.show_category", false) == "true") || false,
			show_relevance: (gs.getProperty("glide.knowman.search.show_relevancy", false) == "true") || false,
			show_last_modified: (gs.getProperty("glide.knowman.search.show_last_modified", false) =="true") || false,
			show_published: (gs.getProperty("glide.knowman.search.show_published", false) == "true") || false,
			show_unpublished: (gs.getProperty("glide.knowman.show_unpublished", false) == "true") || false,
			show_view_count: (gs.getProperty("glide.knowman.search.show_view_count", false) == "true") || false,
			show_rating: (gs.getProperty("glide.knowman.search.show_rating", false) == "true") || false
		};
		data.ariaMsgs = {
			searchCompleted: gs.getMessage("Showing {0} search results based on field {1}"),
			searching: gs.getMessage("Searching for {0}"),
			loadingMoreResults: gs.getMessage("Loading more results"),
			resultsLoaded: gs.getMessage("More results loaded"),
			allResultsLoaded: gs.getMessage("Showing all {0} search results"),
			noMatchingResults: gs.getMessage("No matching results found for {0}"),
			noResultsToDisplay: gs.getMessage("No results to display")
		};
		data.i18nMsgs = {
			'KB_VIEW': gs.getMessage("{0} view"),
			'KB_VIEWS': gs.getMessage("{0} views"),
			'RATING': gs.getMessage("{0} star rating"),
			'NO_RATING': gs.getMessage("No rating"),
			'CLICK_HERE': gs.getMessage("Click here to view this result. This result will open in a new window.")
		};
	}
	if(input) {
		if(input.action == "get_article_content"){
			data.knowledge_content =  new KBViewModel().getArticleContentBySysId(input.articleId);
		}

		if(input.action == "register_kb_view" && input.articleId){
			var kb = new GlideRecordSecure("kb_knowledge");
			if (kb.get(input.articleId)) {
				data.viewCount = parseInt(kb.getValue('sys_view_count')) + 1;

				var paramObj = {};
				paramObj["glideSessionId"] = gs.getSessionID();
				paramObj["displayVal"] = kb.getDisplayValue();
				paramObj["domainId"] = gs.getSession().getCurrentDomainID();
				if(input.tsQueryId)
					paramObj["ts_query_id"] = input.tsQueryId;

				new KBViewModel().increaseKBView(kb);
				gs.eventQueue('kb.view', kb, JSON.stringify(paramObj), gs.getUserID());
			}
		}
	}
})();
