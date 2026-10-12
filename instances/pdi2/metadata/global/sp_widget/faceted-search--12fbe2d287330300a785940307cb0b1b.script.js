(function() {

    var portalRecord = $sp.getPortalRecord();
    data.aisEnabled = $sp.isAISearchEnabled();
    data.isAINativeChatEnabled = $sp.isAINativeChatEnabled();
    data.facetTitle = options.facet_list_title ? gs.getMessage(options.facet_list_title) : gs.getMessage('Filters');
    data.SEARCH_RESULTS = gs.getMessage('Search Results');
    data.resultFilterMsg = gs.getMessage('filtered result returned');
    data.noResultsMsg = gs.getMessage('no results returned');
    data.resultsFilterMsg = gs.getMessage('filtered results returned');
    data.resultUnFilterMsg = gs.getMessage('unfiltered result returned');
    data.resultsUnFilterMsg = gs.getMessage('unfiltered results returned');
    data.paginationMsg = gs.getMessage('load more results below');
    data.limitMsg = gs.getMessage("results are being limited, try using filters or more specific keywords");
    data.isMobile = gs.isMobile();
    var portalName = portalRecord && portalRecord.getValue('url_suffix');
    var portalId = portalRecord && portalRecord.getUniqueValue();
    if (data.aisEnabled) {
        data.isSearchFromChat = $sp.getParameter('searchFromChat') ? true : false;
        data.persistFacetsAcrossTabs = gs.getProperty("glide.ais.facets.cross_tab_persistence").toLowerCase() == "true";
        data.disableGeniusHref = gs.getProperty("glide.search.disable_genius_result_href", "true").toLowerCase() == "true";
        data.disableHref = gs.getProperty("glide.search.disable_result_href", "true").toLowerCase() == "true";
        data.showTypeaheadSearch = options.show_typeahead_search == 'true';
        data.breadcrumbsWidget = $sp.getWidget('breadcrumbs');
        var typeAheadOptions = {};
        typeAheadOptions.placeholder = options.placeholder;
        typeAheadOptions.refresh_page_on_search_submission = false;
        typeAheadOptions.disable_all_suggestions = ($sp.getParameter('disableAllSuggestions') == 'true');
        data.searchTerm = $sp.getParameter('q');
        data.spellCheckFontSize = options.spell_check_font_size ? options.spell_check_font_size : "sm";
        data.resultCountFontSize = options.result_count_font_size ? options.result_count_font_size : "md";
        data.queryForConversationalCatalog = false;
        var vaEvamDefinitionId = $sp.isDynamicChatAssistantEnabled() || $sp.isAINativeChatEnabled() ? "b224e17e530020103296ddeeff7b123f" : "";
        data.searchContextConfigId = getConfigValue('search_application');
        data.canAskFollowUp = "false";
        var sysDeploymentChannelId = "";
        if ($sp.isAINativeChatEnabled() || $sp.isNowAssistEnabled() || $sp.isDynamicChatAssistantEnabled()) {
            var searchConfigDetails = $sp.getSearchApplicationConfigForNASSEnabledPortal();
            var experienceType = $sp.isNowAssistEnabled() ? "self_service" : $sp.isAINativeChatEnabled() ? "ai_native_chat" : "self_service_dialog";
            var deploymentChannelHelper = new sn_nowassist_va.NowAssistDeploymentChannelHelper();
            var deploymentChannelGr = deploymentChannelHelper._getDeploymentChannelForExperience('sp_portal', $sp.getPortalRecord().getUniqueValue(), experienceType);
            if (deploymentChannelGr.next()) {
                sysDeploymentChannelId = deploymentChannelGr.getUniqueValue();
            }
            if (typeof searchConfigDetails != undefined || searchConfigDetails != "") {
                try {
                    var configs = JSON.parse(searchConfigDetails);
                    data.searchContextConfigId = configs && configs.search_context_config ? configs.search_context_config : "a3f76e4377853110f9b9f8fb8c5a991d";
                    vaEvamDefinitionId = configs && configs.search_evam_config_id ? configs.search_evam_config_id : vaEvamDefinitionId;
                    var isSplitProfile = configs && configs.is_split_profile === true;
                    data.canAskFollowUp = !isSplitProfile;
                    data.queryForConversationalCatalog = !isSplitProfile;
                } catch (e) {
                    // Added fallback to default Now assist VA SAC shipped as part of store app
                    data.searchContextConfigId = "a3f76e4377853110f9b9f8fb8c5a991d";
                }

            }
        }
			
        data.filterGeniusResultsBySource = getFilterGeniusResultsByTab(data.searchContextConfigId);
			
        try {
            data.showGeniusResults = new AISGeniusResultsLinkedToSearchApplication().areGeniusResultsLinked(data.searchContextConfigId);
        } catch (e) {
            data.showGeniusResults = true;
        }
        var streamingEnabled = gs.getProperty("glide.search.genius_results.portal_streaming_enabled", true).toLocaleLowerCase();

        var searchFilters = $sp.getParameter('searchFilters') != null ? JSON.stringify($sp.getParameter('searchFilters').split(',')) : '[]';

        data.searchConfig = [{
            definitionSysId: '0cac8b3073ad101052c7d5fdbdf6a78a',
            type: 'GRAPHQL',
            inputValues: {
                searchContextConfigId: {
                    type: 'JSON_LITERAL',
                    value: data.searchContextConfigId
                },
                searchTerm: {
                    type: 'JSON_LITERAL',
                    value: data.searchTerm
                },
                searchEvamConfigId: {
                    type: 'JSON_LITERAL',
                    value: getConfigValue('search_results_configuration')
                },
                facetFilters: {
                    type: 'JSON_LITERAL',
                    value: $sp.getParameter('facetFilters')
                },
                searchFilters: {
                    type: 'JSON_LITERAL',
                    value: searchFilters,
                },
                disableSpellCheck: {
                    type: 'JSON_LITERAL',
                    value: $sp.getParameter('disableSpellCheck') || 'false'
                },
                paginationToken: {
                    type: 'JSON_LITERAL',
                    value: $sp.getParameter('paginationToken')
                },
                sortOptions: {
                    type: 'JSON_LITERAL',
                    value: JSON.stringify([$sp.getParameter('sortOptions')] || [])
                },
                additionalContext: {
                    type: 'JSON_LITERAL',
                    value: '{"portalId": "' + portalId + '","citationVersion":"2","streaming": {"context": {"skipNoAnswerResponse": "true"}},"request_origin":{"origin":"portal","name":"'+portalName+'"} , "queryConversationalCatalog":"' +
                        data.queryForConversationalCatalog +
                        '", "sys_deployment_channel_id":"' +
                        sysDeploymentChannelId +
                        '"}'
                },
                asyncParams: {
                    type: 'JSON_LITERAL',
                    value: '{asyncMode: \"GR_ONLY\", callbackType: \"AMB\", enableStreaming: \"' + streamingEnabled + '\"}'
                },
                searchPurview: {
                    type: 'JSON_LITERAL',
                    value: data.isSearchFromChat || data.isAINativeChatEnabled ? 'REGULAR' : 'ALL'
                },
                vaEvamDefinitionId: {
                    type: 'JSON_LITERAL',
                    value: vaEvamDefinitionId
                },
                uiContext: {
                    type: 'JSON_LITERAL',
                    value: JSON.stringify({
                        uiPlatform: "desktop",
                        uiSource: "portal",
                        uiApplicationTable: "sp_portal",
                        uiApplicationId: portalId,
                        nowAssistDeploymentChannelId: sysDeploymentChannelId
                    })
                }
            }
        }];

        var resultMap = $sp.getAISearchResultsActionConfig(data.searchContextConfigId, portalId);
        resultMap = JSON.parse(resultMap);
        data.tableToSourceMap = resultMap.tableToSourceMap;
        data.sourceToPageMap = resultMap.sourceToPageMap;
        data.urlMap = resultMap.urlMap;
        typeAheadOptions.search_application = data.searchContextConfigId;
        data.typeaheadSearchWidget = $sp.getWidget('typeahead-search', typeAheadOptions);
        return;
    }
    if (input && input.action === "GlideSPSearchAnalytics") {
        input.action = "";
        var textSearchAnalytics = $sp.publishSearchAnalytics(JSON.stringify(input.payload));
        return;
    }


    data.showPrices = $sp.showCatalogPrices();
    data.q = $sp.getParameter('q');
    data.t = $sp.getParameter('t');
    data.searchSources = {};
    data.resultTemplates = {};
    data.searchSourceConfiguration = {};

    options.refresh_page_on_search_submission = false;
    data.typeaheadSearchWidget = $sp.getWidget('typeahead-search', options);
    data.breadcrumbsWidget = $sp.getWidget('breadcrumbs');
    data.limit_group = options.max_group || 15;
    data.limit_all = options.max_all || 30;
    data.showTypeaheadSearch = options.show_typeahead_search == "true";
    data.portalID = $sp.getPortalRecord().getUniqueValue();
    data.isLocationTrackerDisabled = gs.getProperty('glide.service_portal.disable_location_tracker');

    var portalID = $sp.getPortalRecord().getUniqueValue();
    var searchSources = $sp.getSearchSources(portalID);
    var i = 0;
    searchSources.forEach(function(searchSource) {
        data.resultTemplates["sp-search-source-" + searchSource.id + ".html"] = $sp.translateTemplate(searchSource.template);
        data.searchSources[searchSource.id] = {
            name: searchSource.name,
            id: searchSource.id,
            order: i++
        };
        data.searchSourceConfiguration[searchSource.id] = searchSource.sys_id;
    });

    if (data.t) {
        data.t_label = data.searchSources[data.t].name;
    } else {
        data.t_label = gs.getMessage("All");
    }

    function getConfigValue(configName) {
        // Provides the value of the configuration. Fetches config value from URL else portal record.
        return $sp.getParameter(configName) || portalRecord.getValue(configName) || '';

    }
	
    function getFilterGeniusResultsByTab(searchContextConfigId) {
        var cacheName = 'filter_gr_by_source_for_sac_cache';
        var filterGeniusResultsBySource = GlideCacheManager.get(cacheName, data.searchContextConfigId);
        if (filterGeniusResultsBySource == null) {
          filterGeniusResultsBySource = false;
          var searchAppGr = new GlideRecord('sys_search_context_config');
          if (searchAppGr.isValidField('filter_genius_results_by_search_source') && searchAppGr.get(data.searchContextConfigId)) {
            filterGeniusResultsBySource = searchAppGr.getValue('filter_genius_results_by_search_source') && searchAppGr.getValue('filter_genius_results_by_search_source').toLowerCase() == '1'; // 1 = true
            if (filterGeniusResultsBySource) {
              var profileGeniusResults = new GlideRecord('ais_search_profile_ais_genius_result_configuration_m2m');
              profileGeniusResults.addQuery('profile', searchAppGr.getValue('search_profile'));
              var geniusResultCondition = profileGeniusResults.addJoinQuery('ais_genius_result_configuration', 'genius_result_configuration', 'sys_id');
              geniusResultCondition.addCondition('sys_id', '088c73a5430302104eaff03a5ab8f22f')
              geniusResultCondition.addCondition('active', true);
              profileGeniusResults.query();
              if (profileGeniusResults.next())
                filterGeniusResultsBySource = false; // Don't filter GRs by source when Multi-Content Genius Result is being used, since it spans multiple search sources
            }
          }
          GlideCacheManager.put(cacheName, data.searchContextConfigId, filterGeniusResultsBySource);
        }
        return filterGeniusResultsBySource;
    }

})();
