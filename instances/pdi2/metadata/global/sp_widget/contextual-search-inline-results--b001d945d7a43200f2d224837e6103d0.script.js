(function() {
	if(!input){
		var rpSysId = options.cat_item || $sp.getParameter("sys_id");
		var portalPage = $sp.getPortalRecord();
		var aisaEnabled = GlidePluginManager.isActive('com.snc.ai_search_assist');
		var aisPortalEnabled = false;
		if (aisaEnabled) {
			var rpUtils = new AISARecordProducerUtils();
			aisaEnabled = rpUtils.useAISARecordProducerConfig(rpSysId);

			aisPortalEnabled = portalPage && !!portalPage.enable_ais;
			var isMesp = rpUtils.isMesp(portalPage.getUniqueValue());
			if (isMesp)
				aisPortalEnabled = portalPage && (rpUtils.getNowMobileSearchEngine() == 'ai_search');
		}

		data.useAISA = aisaEnabled && aisPortalEnabled;

		data.cxs = {
			session: gs.generateGUID(),
			displayed_on: "record_producer:" + rpSysId,
			config: new sn_cxs.CXSUIConfig().getRPConfig(rpSysId) || {},
			property: {
				show_meta_data: gs.getProperty("com.snc.contextual_search.widget.form.show_meta_data", false) == "true" || false,
				wait_time: parseInt(gs.getProperty("com.snc.contextual_search.wait_time", 500)),
				min_length: parseInt(gs.getProperty("com.snc.contextual_search.min_length", 4), 10)
			},
			kb_property: {
				show_author: (gs.getProperty("glide.knowman.search.show_author", false) == "true" || false),
				show_article_number: (gs.getProperty("glide.knowman.search.show_article_number", false) == "true" || false),
				show_category: (gs.getProperty("glide.knowman.search.show_category", false) == "true" || false),
				show_relevance: (gs.getProperty("glide.knowman.search.show_relevancy", false) == "true" || false),
				show_last_modified: (gs.getProperty("glide.knowman.search.show_last_modified", false) =="true" || false),
				show_published: (gs.getProperty("glide.knowman.search.show_published", false) == "true" || false),
				show_unpublished: (gs.getProperty("glide.knowman.show_unpublished", false) == "true" || false),
				show_view_count: (gs.getProperty("glide.knowman.search.show_view_count", false) == "true" || false),
				show_rating: (gs.getProperty("glide.knowman.search.show_rating", false) == "true" || false)
			},
			/*
			Getting list of knowledge bases configured in portal into knowlesgeBase variable.
			This variable can used from client script to filter results as per knowledge bases. 
		*/
			knowledgeBase: String($sp.getKnowledgeBases()),
			catalog: String($sp.getCatalogs().value + "")
		};
		var i18nMsgs = {
			noRating: gs.getMessage("No rating"),
			rating: gs.getMessage("{0} star rating"),
			views: gs.getMessage("{0} views"),
			view: gs.getMessage("{0} view"),
			comment: gs.getMessage("{0} comment"),
			comments: gs.getMessage("{0} comments"),
			reply: gs.getMessage("{0} reply"),
			replies: gs.getMessage("{0} replies"),
			clickHere: gs.getMessage("Click here to view this result. This result will open in a new window."),
			catalog: {
				order: gs.getMessage("Navigates to '{0}' catalog page")
			},
			trueValue: gs.getMessage("true")
		};
		var ariaMsgs = {
			searchCompleted: gs.getMessage("Showing {0} search results based on field {1}"),
			searching: gs.getMessage("Searching for {0}"),
			loadingMoreResults: gs.getMessage("Loading more results"),
			resultsLoaded: gs.getMessage("More results loaded"),
			allResultsLoaded: gs.getMessage("Showing all {0} search results"),
			noMatchingResults: gs.getMessage("No matching results found for {0}"),
			noResultsToDisplay: gs.getMessage("No results to display")
		};
		data.ariaMsgs = ariaMsgs;
		data.i18nMsgs = i18nMsgs;
		data.isA11yEnabled = GlideAccessibility.isEnabled();
	}
	if(input){
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
