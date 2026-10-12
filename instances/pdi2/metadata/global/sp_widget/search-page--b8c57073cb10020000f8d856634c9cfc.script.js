(function() {
    if (input && input.action === "GlideSPSearchAnalytics") {
        input.action = "";
        var textSearchAnalytics = $sp.publishSearchAnalytics(JSON.stringify(input.payload));
        return;
    }

// populate the 'data' variable
data.showPrices = $sp.showCatalogPrices();
data.q = $sp.getParameter('q');
data.t = $sp.getParameter('t');
data.results = [];
data.searchSources = [];
data.searchSourceConfiguration = {};
//Provide searchType, portal and page information for Service Portal search analytics
data.searchType = "search";
data.isLocationTrackerDisabled = gs.getProperty('glide.service_portal.disable_location_tracker');
var pageId = $sp.getParameter('id');
var pageGr = null;
if (pageId)
	pageGr = new GlideRecordSecure('sp_page');
if (pageGr && pageGr.get('id', pageId))
	data.page = pageGr.getUniqueValue();
var portalRecord = $sp.getPortalRecord();
data.portal = portalRecord && portalRecord.getUniqueValue();

options.show_did_you_mean = (options.show_did_you_mean == true || options.show_did_you_mean == "true");

if (data.t)
	data.limit = options.max_group || 15;
else
	data.limit = options.max_all || 30;

//Gotta decide if we want to use the portal's sources, or use the defaults declared by
//the sys property
var useDefaultPortals;
if (!$sp.getPortalRecord()) {
	useDefaultPortals = true;
} else {
	var searchSourcesForPortalGR = new GlideRecordSecure("m2m_sp_portal_search_source");
	searchSourcesForPortalGR.addQuery("sp_portal", $sp.getPortalRecord().getUniqueValue());
	searchSourcesForPortalGR.query();
	useDefaultPortals = searchSourcesForPortalGR.getRowCount() == 0;
}

data.resultTemplates = {};

if (useDefaultPortals) {
	var defaultSearchSourceGR = new GlideRecordSecure("sp_search_source");
	var defaultSearchSourceIDList = gs.getProperty("glide.service_portal.default_search_sources", "");
	defaultSearchSourceGR.addQuery("sys_id", "IN", defaultSearchSourceIDList);
	if (data.t)
		defaultSearchSourceGR.addQuery("id", data.t);
	defaultSearchSourceGR.query();
	while(defaultSearchSourceGR.next()) {
		data.resultTemplates["sp-search-source-" + defaultSearchSourceGR.getValue("id") + ".html"] = $sp.translateTemplate(defaultSearchSourceGR.getValue("search_page_template"));
		getResults(defaultSearchSourceGR);
		var SearchSourceId = defaultSearchSourceGR.getValue("id");
		data.searchSources.push(SearchSourceId);
		data.searchSourceConfiguration[SearchSourceId] = defaultSearchSourceGR.getValue("sys_id");
	}
} else {
	var m2mSearchSourceGR = new GlideRecordSecure("m2m_sp_portal_search_source");
	if (data.t)
		m2mSearchSourceGR.addQuery("sp_search_source.id", data.t);
	m2mSearchSourceGR.addQuery("sp_portal", $sp.getPortalRecord().getUniqueValue());
	m2mSearchSourceGR.query();
	while(m2mSearchSourceGR.next()) {
		var searchSourceGR = m2mSearchSourceGR.getElement("sp_search_source").getRefRecord();
		data.resultTemplates["sp-search-source-" + searchSourceGR.getValue("id") + ".html"] = $sp.translateTemplate(searchSourceGR.getValue("search_page_template"));
		getResults(searchSourceGR);
		var SearchSourceId = searchSourceGR.getValue("id");
		data.searchSources.push(SearchSourceId);
		data.searchSourceConfiguration[SearchSourceId] = searchSourceGR.getValue("sys_id");
	}
}

function getResults(gr) {
	//Check if the user is allowed to see this source.
	if ($sp.isUserCriteriaEnabled()) {
		if (!$sp.userCanSeeSearchSourceByCriteria(gr.getUniqueValue()))
			return;
	} else {
		var gs = GlideSession.get();
		var searchSourceRoles = gr.getValue("roles");
		if (searchSourceRoles && !gs.hasRole(searchSourceRoles))
			return;
	}

	if (gr.is_scripted_source) {
		var input = {};
		input.query = data.q;
		input.facets = {};
		input.indexGroup = 'portal_index_group';
		input.$sp = $sp;
		var evaluator = new GlideScopedEvaluator();
		var results = evaluator.evaluateScript(gr, "data_fetch_script", input);
		if(results) {
			results.forEach(function(item) {
				item.templateID = "sp-search-source-" + gr.getValue("id") + ".html";
				data.results.push(item);
			});
		}
	} else {
		var primaryField = gr.getValue("primary_display_field");
		var displayFields = gr.getValue("display_fields");

		var resultGR = new GlideRecordSecure(gr.getValue("source_table"));
		var condition = gr.getValue("condition");
		if (condition)
			resultGR = $sp.addQueryString(resultGR, condition);
		if (data.q)
			resultGR.addQuery('123TEXTQUERY321', data.q);
		resultGR.query();

		var searchTableCount = 0;
		while (resultGR.next() && searchTableCount < data.limit) {
			if (!resultGR.canRead())
				continue;

			var secondaryValues = [];

			if (displayFields)
				displayFields.split(",").forEach(function(field) {
					var obj = getField(resultGR, field);
					secondaryValues.push(obj);
				});

			var itemScore = 0;
			if (resultGR.ir_query_score)
			    itemScore = parseInt(resultGR.ir_query_score.getDisplayValue());

			data.results.push({
				score: itemScore,
				primary: (primaryField) ? resultGR.getValue(primaryField) : resultGR.getDisplayValue(),
				sys_id: resultGR.getUniqueValue(),
				table: resultGR.getTableName(),
				templateID: "sp-search-source-" + gr.getValue("id") + ".html",
				fields: secondaryValues,
				type: gr.getValue("id")
			});
			searchTableCount++;
		}
	}

	if (data.results.length == 0 && options.show_did_you_mean) {
		var didYouMean = new GlideTSDidYouMean();
		var suggestions = [];
		data.suggestions = [];
		if (data.t == 'kb')
			suggestions = didYouMean.getAlternatePhrases(data.q, 'kb_knowledge');
		else if (data.t == 'sc')
			suggestions = didYouMean.getAlternatePhrases(data.q, 'sc_cat_item');
		else
			suggestions = didYouMean.getAlternatePhrases(data.q, gr.getValue("source_table"));

		for(var i=0; i<suggestions.size(); i++) {
			 if(data.suggestions.indexOf(suggestions.get(i) + '') == -1)
					data.suggestions.push(suggestions.get(i) + '');
		}
	}
}

function getField(gr, name) {
	var f = {};
	f.display_value = gr.getDisplayValue(name);
	f.value = gr.getValue(name);
	var ge = gr.getElement(name);
	if (ge == null)
		return f;

	f.type = ge.getED().getInternalType()
	f.label = ge.getLabel();
	return f;
}
})();
