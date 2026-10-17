var NAUnifiedSearchTroubleshootingScript = Class.create();
NAUnifiedSearchTroubleshootingScript.prototype = {
    APPS_VERSION_QUERY: "scopeLIKEsn_azure_openai^ORscopeLIKEsn_vad_genai^ORscopeLIKEsn_nowassist_va^ORscopeLIKEsn_uxc_gen_ai^ORscopeLIKEsn_chat_summary^ORscopeLIKEsn_oe_sfs^ORscopeLIKEsn_ace^ORscopeLIKEsn_ais_assist^ORscopeLIKEsn_nowassist_admin^ORscopeLIKEsn_catalog_con_cov^ORscopeLIKEsn_ms_oem^ORscopeLIKEsn_now_assist_cr^ORscopeLIKEsn_itsm_gen_ai^ORscopeLIKEsn_nowassist_gs^ORscopeLIKEsn_km_gen_ai^ORscopeLIKEsn_skill_builder",

    PROPERTIES_QUERY: "name=glide.cs.runtime.user_input_max_length^ORname=sn_ais_assist.dpr_ingestion_completed",

    initialize: function() {},

    runAllSteps: function(portalSuffix, query) {
        gs.info("***** App version ********\n");
        this.printAppsVersion();
        gs.info("\n");
        gs.info("***** System Properties ********\n");
        this.printSystemProperties();
        gs.info("\n");
        gs.info("***** Deployment config for portal ********\n");
        var deploymentConfig = this.getDeploymentConfigForPortal(portalSuffix);
        gs.info("\n");
		if (deploymentConfig['search_application']) {
			this.getAISearchResult(query, deploymentConfig['search_application']);
		}

    },

    printAppsVersion: function() {
        var appGr = new GlideRecord("sys_store_app");
        appGr.initialize();
        appGr.addEncodedQuery(this.APPS_VERSION_QUERY);
        appGr.query();
        while (appGr.next()) {
            gs.info("App: " + appGr.getValue("name") + " (" + appGr.getValue("scope") + ") : Version: " + appGr.getValue("version"));
        }
    },

    printSystemProperties: function() {
        var propGr = new GlideRecord("sys_properties");
        propGr.initialize();
        propGr.addEncodedQuery(this.PROPERTIES_QUERY);
        propGr.query();
        while (propGr.next()) {
            gs.info("Prop name: " + propGr.getValue("name") + " : value: " + propGr.getValue("value"));
        }
    },

    getDeploymentConfigForPortal: function(portalSuffix) {
		var deploymentConfig = {}; 

        var portalSysId = this._getPortalSysId(portalSuffix);
        if (gs.nil(portalSysId)) {
            gs.error("No portal found for suffix : " + portalSuffix);
            return;
        }

        //get deployment channel record: 
        var deploymentChannelGr = new GlideRecord("sys_now_assist_deployment_channel");
        deploymentChannelGr.addQuery("document_table", 'sp_portal');
        deploymentChannelGr.addQuery("document_id", portalSysId);
        deploymentChannelGr.addQuery("active", true);
        deploymentChannelGr.query();
        if (deploymentChannelGr.next() && deploymentChannelGr.isValidRecord()) {
            gs.info("Deployment name: " + deploymentChannelGr.now_assist_deployment.name);

            //get experience and search profile if valid fields. 
            if (deploymentChannelGr.isValidField("experience"))
                gs.info("Experience: " + deploymentChannelGr.getValue("experience"));
            if (deploymentChannelGr.isValidField("search_application")) {
                gs.info("Search Application: " + deploymentChannelGr.search_application);
                gs.info("Search Profile:" + deploymentChannelGr.search_application.search_profile.label + " - id: " + deploymentChannelGr.search_application.search_profile);
				deploymentConfig['search_application'] = deploymentChannelGr.search_application+"";
            }
        }
		return deploymentConfig;

    },

    enableDebugger: function() {

    },

    disableDebugger: function() {

    },

    getAISearchResult: function(query, searchContextConfigId) {
        var searchTerm = query;
        var disableSpellCheck = false;
        var facetFilters = [];
        var searchFilters = [];
        var paginationToken = null;
        var sortOptions = null;
        var locale = 'en';
        var additionalContext = null;
        var semanticSearch = true;
        var forceSkipSignalsLogging = true;
        var isDebug = true;
        var requestedFields = {
            sc_cat_item: ['name', 'short_description']
        };
        var api = new sn_search.ScriptableSearchAPI();
        var searchResponse = api.search(searchContextConfigId, searchTerm, paginationToken, disableSpellCheck, facetFilters, searchFilters, requestedFields, locale, additionalContext, semanticSearch, isDebug, forceSkipSignalsLogging);

        gs.info('=========Regular Search Results=========');
        gs.info('');
        gs.info('Regular Response count: ' + searchResponse.getCount());
        gs.info('');
        for (var ct = 0; ct < searchResponse.getCount(); ct++) {
            gs.info('=========Regular Result: ' + (ct + 1) + '=========');
            gs.info('Response Text: ' + JSON.stringify(searchResponse.getSearchResults()[ct].getText()));
            gs.info('Response Title: ' + JSON.stringify(searchResponse.getSearchResults()[ct].getTitle()));
            gs.info('Response URL: ' + JSON.stringify(searchResponse.getSearchResults()[ct].getUrl()));
            gs.info('Semantic Embedding: ' + JSON.stringify(searchResponse.getSearchResults()[ct].getSemanticEmbedding()));
            gs.info('Semantic Similarity: ' + JSON.stringify(searchResponse.getSearchResults()[ct].getSemanticSimilarity()));
            gs.info('');
        }

        gs.info('=========Genius Search Results=========');
        gs.info('');
        var grCount = searchResponse.getGeniusResults().length;
        gs.info('Genius Response count: ' + grCount);
        for (var ct = 0; ct < grCount; ct++) {
            gs.info('=========Genius Result: ' + (ct + 1) + '=========');
            var grResult = searchResponse.getGeniusResults()[ct];
            var grData = grResult.getData();
            var fieldMap = {};
            for (var fieldIdx = 0; fieldIdx < grData.length; fieldIdx++) {
                fieldMap[grData[fieldIdx].getLabel()] = grData[fieldIdx].getDisplayValue();
            }
            gs.info('Genius Result Data: ' + JSON.stringify(fieldMap));
            gs.info('');
        }
    },

    _getPortalSysId: function(portalSuffix) {
        var portalGr = new GlideRecord("sp_portal");
        portalGr.initialize();
        portalGr.addQuery("url_suffix", portalSuffix);
        portalGr.query();
        if (portalGr.next() && portalGr.isValidRecord())
            return portalGr.getValue("sys_id");

        return null;

    },


    type: 'NAUnifiedSearchTroubleshootingScript'
};
