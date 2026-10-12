var cxs_SearchServerAJAX = Class.create();

cxs_SearchServerAJAX.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	isConfigured: function() {
		var serverId = this.getParameter("sysparm_server_id");

		var scc = new GlideRecordSecure('cxs_context_config');
        scc.addQuery('cxs_searcher_config', "IN", serverId);
        scc.query();

        return scc.hasNext();
    },

	getFirstAction: function(){
		var paramsJSON = this.getParameter('sysparm_params_obj');
		var paramsObj = new global.JSON().decode(paramsJSON);
		if (!paramsObj['resource_id'])
			return;

		var sau = new SNC.SearchActionUtils();
		sau.loadRecords(paramsObj['current_table'], paramsObj['current_id'], paramsObj['result_table'], paramsObj['result_id']);
		var actionGr = sau.getFirstAction_Platform(paramsObj['table_config_id'], paramsObj['resource_id']);
		var result = '';
		if (actionGr && actionGr.isValidRecord()) {
			var actionObj = {
				actionId: actionGr.search_ui_action.action_id.getValue(),
				actionValue: actionGr.action_value.getValue(),
				actionLabel: actionGr.action_label.getValue(),
				restAPI: actionGr.search_ui_action.rest_api ? actionGr.rest_api.getValue() : ''
			};
			result = new global.JSON().encode(actionObj);
		}
		return result;
	},

	ajaxFunction_getResources: function(){
		var searchContextId = this.getParameter('sysparm_context_id');
		var displayDropdown = this.getParameter('sysparm_display_dropdown');

		return new global.JSON().encode(this.getResources(searchContextId, displayDropdown));
	},

	getResources: function(searchContextId, displayDropdown) {
		var answer = {};

		// var searchContextId = this.getParameter('sysparm_context_id');
		// var displayDropdown = this.getParameter('sysparm_display_dropdown');
		var searcherId = "";
		var searchOnTab = false;
		var searcherText = "";
		var defSearcherResource = "all";

		var searchContextGr = new GlideRecord("cxs_context_config");
		searchContextGr.get(searchContextId);
		if (searchContextGr) {
			searcherId = searchContextGr.getValue("cxs_searcher_config");
			defSearcherResource = searchContextGr.getValue("default_searcher_resource");
			searchOnTab = searchContextGr.getValue("search_on_tab") === "1";
			searcherText = (searchContextGr.getDisplayValue("searcher_text")) ? searchContextGr.getDisplayValue("searcher_text") : gs.getMessage("Default Sources");
		}

		answer.searcherText = searcherText;
		answer.searchOnTab = searchOnTab;

		if (displayDropdown) {
			answer.additionalSearchResources = (searchOnTab) ? this._getAdditionalSearchResources(searchContextId) : [];

			var defAdditional = answer.additionalSearchResources.some(function(resource) {
				return resource.defaultSearch;
			});

			answer.searchResources = this._getSearchResources(searcherId);
			if (!defAdditional && defSearcherResource !== "all")
				answer.searchResources.forEach(function(resource) {
					if (resource.id === defSearcherResource)
						resource.defaultSearch = true;
				});
		}

		answer.displayDropdown = (displayDropdown && (answer.searchResources.length + answer.additionalSearchResources.length > 1)) ? true : false;
		return answer;
	},

	_getSearchResources: function(searcherId) {
		var searchResources = [];

		if (!searcherId)
			return searchResources;

		var resourceGr = new GlideRecord("cxs_search_res_config");
		resourceGr.addQuery("cxs_searcher_config", searcherId);
		resourceGr.addActiveQuery();
		resourceGr.orderBy("order");
		resourceGr.query();

		var labelMap = {pinned: gs.getMessage("Pinned Articles"), catalog: gs.getMessage("Catalog Items"), knowledge: gs.getMessage("Knowledge Articles"), social: gs.getMessage("Questions"), community_question: gs.getMessage("Community Question"), community_answer: gs.getMessage("Community Answer"), community_blog: gs.getMessage("Community Blogs")};

		while (resourceGr.next()) {
			var name = resourceGr.name.getDisplayValue();
			searchResources.push({
				label: resourceGr.label.getDisplayValue() ? resourceGr.label.getDisplayValue() : ((name in labelMap) ? labelMap[name] : name),
				id: resourceGr.getUniqueValue()
			});
		}

		return searchResources;
	},

	_getAdditionalSearchResources: function(searchContextId) {
		var addtlSearchResources = [];

		var addtlResourceGr = new GlideRecord("cxs_res_context_config");
		addtlResourceGr.addQuery("cxs_context_config", searchContextId);
		addtlResourceGr.addNotNullQuery("cxs_search_res_config.resource_type");
		addtlResourceGr.addQuery("cxs_search_res_config.active", true);
		addtlResourceGr.addActiveQuery();
		addtlResourceGr.addEncodedQuery("cxs_search_res_config.recommendation!=true^ORcxs_search_res_config.recommendationISEMPTY");
		addtlResourceGr.orderByDesc("default_search");
		addtlResourceGr.orderBy("order");
		addtlResourceGr.query();
		while (addtlResourceGr.next()) {
			addtlSearchResources.push({
				label: addtlResourceGr.cxs_search_res_config.label.getDisplayValue() ? addtlResourceGr.cxs_search_res_config.label.getDisplayValue() : addtlResourceGr.cxs_search_res_config.name.getDisplayValue(),
				id: addtlResourceGr.getValue("cxs_search_res_config"),
				defaultSearch: addtlResourceGr.getValue("default_search") === "1"
			});
		}
		return addtlSearchResources;
	},

	type: 'cxs_SearchServerAJAX'
});
