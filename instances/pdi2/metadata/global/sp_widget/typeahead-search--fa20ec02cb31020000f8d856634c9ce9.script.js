(function() {
    var portalRecord = $sp.getPortalRecord();
    data.aisEnabled = $sp.isAISearchEnabled();
    data.isAINativeChatEnabled = $sp.isAINativeChatEnabled();
    data.isSearchFromChat = $sp.getParameter('searchFromChat') ? true : false;
    if (data.isSearchFromChat) {
        data.isAINativeChatEnabled = false;
    }
    data.q = $sp.getParameter('q');
    data.emptySearchMessage = gs.getMessage("Search cannot be empty");
	options.search_results_configuration = options.search_results_configuration || $sp.getParameter('search_results_configuration');

    if (options.refresh_page_on_search_submission == undefined)
        data.refreshPageOnSearch = true;
    else
        data.refreshPageOnSearch = options.refresh_page_on_search_submission;

    // AI Search
    data.searchApplicationId = getConfigValue('search_application');
    if (data.aisEnabled && !data.isAINativeChatEnabled) {
        data.disableHref = gs.getProperty("glide.search.disable_suggestion_href", "true").toLowerCase() == "true";
        data.flushTimeStamp = UxFrameworkScriptables.getFlushTimestamp();
        data.displayOnboardingPopover = $sp.isNowAssistEnabled();
        data.nowAssistEnabled = data.isSearchFromChat ? false : $sp.isNowAssistEnabled();
        data.isDynamicChatAssistantEnabled = $sp.isDynamicChatAssistantEnabled();
        data.showSuggestedUtterances = false;
        var additionalContext = {};
        // When Now assist enabled we are changing the querying of SAC record from sputils instead of portal record
        var nowAssistEnabled = $sp.isNowAssistEnabled() || $sp.isDynamicChatAssistantEnabled();
        if (nowAssistEnabled) {
            data.showSuggestedUtterances = true;
            var searchConfigDetails = $sp.getSearchApplicationConfigForNASSEnabledPortal();
            if (typeof searchConfigDetails != undefined || searchConfigDetails != "") {
                try {
                    var configs = JSON.parse(searchConfigDetails);
                    data.searchApplicationId = configs.search_context_config;
                } catch (e) {
                    // Added fallback to default Now assist VA SAC shipped as part of store app
                    data.searchApplicationId = "a3f76e4377853110f9b9f8fb8c5a991d";
                }
            }
            var sysDeploymentChannelId = "";
            var experienceType = $sp.isNowAssistEnabled() ? "self_service" : "self_service_dialog";
            var deploymentChannelHelper = new sn_nowassist_va.NowAssistDeploymentChannelHelper();
            var deploymentChannelGr = deploymentChannelHelper._getDeploymentChannelForExperience('sp_portal', $sp.getPortalRecord().getUniqueValue(), experienceType);
            if (deploymentChannelGr.next()) {
                sysDeploymentChannelId = deploymentChannelGr.getUniqueValue();
            }
            additionalContext.sys_deployment_channel_id = sysDeploymentChannelId;
        } else {
            data.searchApplicationId = options.search_application || portalRecord.getValue('search_application');
        }
        var portalId = $sp.getValue('url_suffix');
        var brandingSettings = {
            chatHeader: 'Now Support'
        };
        try {
            brandingSettings = new sn_nowassist_va.NowAssistDeploymentChannelHelper().getBrandingForPortal(portalId);
        } catch (e) {}
        if (brandingSettings)
            data.assistantName = brandingSettings.chatHeader;
        options.placeholder = options.placeholder ? gs.getMessage(options.placeholder) : (nowAssistEnabled ? "" : gs.getMessage('Search'));
        data.aiSearchSourceFilter = "";
        var aiSearchSource = options.ai_search_source_filter;
        var filterGr = new GlideRecord('sys_search_filter');
        data.exactMatchRegex = new GlideSystem().getProperty("com.snc.service_portal.typeahead.exact_match_request_criterion_regex")
        filterGr.addQuery('ais_search_source', aiSearchSource);
        filterGr.addQuery('search_context_config', data.searchApplicationId);
        filterGr.addActiveQuery();
        filterGr.orderBy('order');
        filterGr.query();
        if (filterGr.next())
            data.aiSearchSourceFilter = filterGr.getUniqueValue();
        portalId = portalRecord && portalRecord.getUniqueValue();
        var resultMap = $sp.getAISearchResultsActionConfig(data.searchApplicationId, portalId);
        resultMap = JSON.parse(resultMap);
        data.tableToSourceMap = resultMap.tableToSourceMap;
        data.sourceToPageMap = resultMap.sourceToPageMap;
        data.urlMap = resultMap.urlMap;
        data.portalId = portalId;
        additionalContext.portalId = portalId;
        data.additionalContext = JSON.stringify(additionalContext);
        data.isOnboardingPopoverDismissed = gs.getBooleanPreference('glide.search.onboarding.popover.dismissed', false);
        return;
    } else if (data.isAINativeChatEnabled) {
        data.deploymentId = portalRecord && portalRecord.getUniqueValue();
        data.nowAssistDeploymentId = new PortalNAChatUtils().getNowAssistDeploymentId(data.deploymentId, 'ai_native_chat');
        data.portalSuffix = $sp.getValue('url_suffix');
        data.enableVoiceInput = gs.getUser().getPreference('glide.ui.accessibility.voice_input.nava') == 'true';
        // Session domain, relayed to the chat client so the conversation is
        // created in the domain the user is working in. The Glide session domain
        // is node-local, so a handshake that misses node affinity would otherwise
        // land in the user's default domain. Resolved here because a portal has
        // no client-side source for it: there is no scope picker on a portal.
        data.sessionDomain = gs.getSession().getCurrentDomainID();
    }

    if (input && input.action === "GlideSPSearchAnalyticsUpdateRank") {
        input.action = "";
        $sp.publishSearchAnalytics(JSON.stringify(input.payload));
        return;
    }
    if (options.title) {
        options.title = gs.getMessage(options.title);
    }

    data.resultMsg = gs.getMessage("Search results.");
    data.navigationMsg = gs.getMessage("To navigate, use up and down arrow keys.");
    data.portalID = portalRecord && portalRecord.getUniqueValue();
    data.searchMsg = gs.getMessage("Search");
    data.searchSuggestionsMsg = gs.getMessage("suggestions");

    data.noResultsFoundMsg = gs.getMessage("No results found");

    data.isSuggestionsEnabled = gs.getProperty('glide.search.suggestions.enabled');
    data.searchTypeBehavior = gs.getProperty('glide.service_portal.search_as_you_type_behavior').toLowerCase();
    data.typeaheadWaitMS = getIntProperty('glide.service_portal.typeahead.wait_ms', '1000');
    data.typeaheadMinLength = getIntProperty('glide.service_portal.typeahead.min_length', '3');
    data.isLocationTrackerDisabled = gs.getProperty('glide.service_portal.disable_location_tracker');
    data.isTypeAheadEnabled = gs.getProperty('glide.service_portal.enable_typeahead', 'true');

    var searchSources;
    data.searchType = null;
    data.searchSources = [];
    if ($sp.getParameter("id") == "search" && $sp.getParameter("t")) {
        data.searchType = $sp.getParameter("t");
        searchSources = $sp.getSearchSources(data.portalID);
    } else {
        var contextualSearchSourceIDs = options.contextual_search_sources || null;
        searchSources = $sp.getSearchSources(data.portalID, contextualSearchSourceIDs);
        if (searchSources.length == 1) {
            data.searchType = searchSources[0].id;
        }
    }

    data.searchSourceSysIds = [];
    data.typeaheadTemplates = {};
    data.searchSourceConfiguration = {};
    searchSources.forEach(function(source) {
        data.searchSourceSysIds.push(source.sys_id);
        if (source.isTypeaheadEnabled) {
            data.searchSources.push(source.id);
        }
        var sourceTemplateConfiguration = {
            sys_id: source.sys_id,
            glyph: source.typeaheadGlyph,
            linkToPage: source.typeaheadPage
        };

        if (source.isAdvancedTypeaheadConfig) {
            sourceTemplateConfiguration.type = "ADVANCED";
            sourceTemplateConfiguration.template = "sp-typeahead-" + source.id + ".html";
            data.typeaheadTemplates["sp-typeahead-" + source.id + ".html"] = $sp.translateTemplate(source.typeaheadTemplate);
        } else {
            sourceTemplateConfiguration.type = "SIMPLE";
            if (!sourceTemplateConfiguration.linkToPage)
                console.log("Warning: No typeahead page or URL provided for search source " + source.name);
        }

        data.searchSourceConfiguration[source.id] = sourceTemplateConfiguration;
    });

    function getIntProperty(name, defaultValue) {
        var answer = parseInt(gs.getProperty(name, defaultValue));
        return isNaN(answer) ? defaultValue : answer;
    }

    function getConfigValue(configName) {
        // Provides the value of the configuration. Fetches config value from URL else portal record.
        return $sp.getParameter(configName) || portalRecord.getValue(configName) || '';
    }

})();
