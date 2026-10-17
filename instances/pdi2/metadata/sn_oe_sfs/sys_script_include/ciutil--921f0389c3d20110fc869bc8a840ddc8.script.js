var CIUtil = Class.create();

CIUtil.prototype = {
    initialize: function() {
        this.CI_PRODUCT_TOUR_TYPE = '55ae0554c32111104b8e88c7c840ddfb';
        this.CI_PRODUCT_TOUR_STEP_TYPE = '1e13d918c32111104b8e88c7c840ddc4';
        this.CONTENT_BLOCK_TABLE = 'sn_ace_content_block';
    },
    PROGRESS_CARD_CONSTANTS: {
        'ACHIEVED': gs.getMessage('Achieved'),
        'PROGRESS_TEXT': [{
                'range': [0, 20],
                'label': gs.getMessage('Off to a good start!')
            },
            {
                'range': [21, 80],
                'label': gs.getMessage('Let\'s keep it up!')
            },
            {
                'range': [81, 99],
                'label': gs.getMessage('Almost there!')
            },
            {
                'range': [100, 100],
                'label': gs.getMessage('Your a machine!')
            }
        ]
    },
    getBrandingSetupCount: function() {
        return this.getRowCount('sys_cs_branding_setup');
    },

    getProviderCount: function() {
        return this.getRowCount('sys_cs_provider');
    },

    getIntegrationsCount: function() {
        return this.getRowCount('sys_cs_provider_application', 'provider=e177dbf3530110102f40ddeeff7b12a7^ORprovider=41a04c42731210104049dec2c4f6a706^ORprovider=7068d549c39310106c9a5230d840dd91^ORprovider=4dd0298d0f9310105375001ea8767e73^ORprovider=6958b90bc3f250106b4653a3a840dde2^ORprovider=fb2e970cffd42210f1bbffffffffffdc');
    },

    getInstalledTeamsCount: function() {
        return this.getRowCount('sys_cs_provider_application', 'provider=e177dbf3530110102f40ddeeff7b12a7');
    },

    getInstalledSlackCount: function() {
        return this.getRowCount('sys_cs_provider_application', 'provider=41a04c42731210104049dec2c4f6a706');
    },

    getInstalledWorkplaceCount: function() {
        return this.getRowCount('sys_cs_provider_application', 'provider=7068d549c39310106c9a5230d840dd91');
    },

    getInstalledMessengerCount: function() {
        return this.getRowCount('sys_cs_provider_application', 'provider=4dd0298d0f9310105375001ea8767e73');
    },

    getInstalledLineCount: function() {
        return this.getRowCount('sys_cs_provider_application', 'provider=6958b90bc3f250106b4653a3a840dde2');
    },

    getInstalledGoogleChatCount: function() {
        return this.getRowCount('sys_cs_provider_application', 'provider=fb2e970cffd42210f1bbffffffffffdc');
    },

    getContextVariableCount: function() {
        return this.getRowCount('sys_cs_virtual_agent_context', 'live_agent_setup=f0acbc4c5f091300e6333654de7313c8');
    },

    getPreChatSurveyCount: function() {
        return this.getRowCount('sys_cs_survey', 'type=prechat^EQ');
    },

    getTopicContextIntentCount: function() {
        return this.getRowCount('sys_cs_context_topic');
    },

    getSystemMessagesCount: function() {
        return this.getRowCount('sys_properties_category_m2m', 'category=4f33892a533e5010ad82ddeeff7b1218');
    },

    getPortalUrlMappingCount: function() {
        return this.getRowCount('sys_cs_portal_url_mapping');
    },

    getSensitiveDataRegexCount: function() {
        if (this.isDataPrivacyForVASupported()) {
            var activePolicyId = this._getActiveDataPrivacyPolicyForVA();
            if (!activePolicyId) {
                return "0";
            }
            return this.getRowCount('dp_m2m_configuration_pattern', 'active=true^config=' + activePolicyId);
        }
        return this.getRowCount('sys_sensitive_data_handling_regex');
    },

    getQuickActionsCount: function() {
        return this.getRowCount('quickactions_workspace_action');
    },

    getTopicRecommendationSettingsCount: function() {
        return this.getRowCount('sn_topic_recommend_default_setting');
    },

    getDeflectionConfigurationCount: function() {
        return this.getRowCount('ssa_deflection_configuration', 'activity_context=7b43fb645383201033cdddeeff7b1246');
    },

    getContextProfileCount: function() {
        return this.getRowCount('sys_cs_context_profile', 'model_type=nlu_keyword^ORmodel_type=');
    },

    getIARSimulationsCount: function() {
        return this.getRowCount('sys_cs_auto_resolution_simulation_configuration');
    },

    getMessagePreviewCount: function() {
        return this.getRowCount('sys_properties', 'name=com.glide.cs.settings.show_message_preview^ORname=com.glide.cs.settings.poll_frequency');
    },

    getActiveTopicsCount: function() {
        return this.getRowCount('sys_cs_topic', 'is_system_topic=false^type!=TOPIC_BLOCK^type!=SETUP_TOPIC^active=true');
    },

    isSensitiveDataHandlingInstalled: function() {
        return GlidePluginManager.isActive('com.glide.sensitive_data_handling');
    },

    isDataPrivacyInstalled: function() {
        return GlidePluginManager.isActive('sn_dp_store_app') && GlidePluginManager.isActive('sn_data_discovery');
    },

    /**
     * Check if CI can use Data Privacy for VA Sensitive data masking features.
     * This is supported with Data Privacy app for Zurich.
     * 
     * @returns true if Data Privacy (for VA) features are supported, false otherwise.
     */
    isDataPrivacyForVASupported: function() {
        return this.isDataPrivacyInstalled() && gs.getProperty('sn_dp_store_app.data_privacy_zurich_support', 'false') === 'true';
    },

    isChatbotInstalled: function() {
        return GlidePluginManager.isActive('com.glide.cs.chatbot');
    },

    isChatbotLiteInstalled: function() {
        return GlidePluginManager.isActive('com.glide.cs.chatbot.lite');
    },

    isTopicRecommenderInstalled: function() {
        return GlidePluginManager.isActive('com.snc.va_topic_recommender');
    },

    isLiveAgentSettingsInstalled: function() {
        return GlidePluginManager.isActive('com.glide.cs.live_agent_settings');
    },

    isProfanityInstalled: function() {
        return GlidePluginManager.isActive('com.sn.va.profanity');
    },

    isQuickActionsInstalled: function() {
        return GlidePluginManager.isActive('com.glide.quickactions');
    },

    isVAAnalyticsInstalled: function() {
        return GlidePluginManager.isActive('sn_ci_analytics');
    },

    isIARInstalled: function() {
        return GlidePluginManager.isActive('com.glide.cs.auto_resolution');
    },

    isConnectSupportInstalled: function() {
        return GlidePluginManager.isActive('com.glide.connect.support');
    },

    isQuickActionsAvailable: function() {
        if (CIPlugin.QuickActions().isActive()) {
            var actionsGr = new GlideRecord('quickactions_workspace_action');
            var quickActionsAvailable = actionsGr.isValid() && actionsGr.canRead();
            return quickActionsAvailable;
        }
        return false;
    },

    isNluEnabled: function() {
        var generalSettingsGR = new GlideRecord("sys_cs_general_settings");
        if (generalSettingsGR.isValid()) {
            generalSettingsGR.query();
            if (generalSettingsGR.next()) {
                return generalSettingsGR.getValue('nlu_enabled') == 1;
            }
        }
        return false;
    },

    isEmailDigestEnabled: function() {
        var emailDigestGR = new GlideRecord("sys_cs_email_notification_settings");
        emailDigestGR.query();
        if (emailDigestGR.next()) {
            return emailDigestGR.getValue('enable_email_digest') == 1;
        }

        return false;
    },

    isMultipleActiveConversationsEnabled: function() {
        var messagingChannelsGr = new GlideRecord('sys_cs_channel');
        if (messagingChannelsGr.get('ea0cb816732110104a905ee515f6a7b5')) {
            return messagingChannelsGr.getValue('supports_multiple_conversations') == 1;
        }
        return false;
    },

    getDefaultConsumerAccountContext: function() {
        var gr = new GlideRecord('sys_cs_consumer_account_context');
        gr.addQuery('is_default', true);
        gr.query();
        if (gr.next()) {
            if (gr.getValue('short_description')) {
                return gr.getValue('short_description');
            }
            return gr.getValue('name');
        }
    },

    isIarEnabled: function() {
        if (CIPlugin.IAR().isActive()) {
            var isIarEnabled = gs.getProperty('com.glide.cs.enable_auto_resolution') === 'true';
            var autoResolutionGR = new GlideRecordSecure('sys_cs_auto_resolution_configuration');
            if (isIarEnabled && autoResolutionGR.isValid()) {
                autoResolutionGR.addActiveQuery();
                autoResolutionGR.query();
                isIarEnabled = autoResolutionGR.hasNext();
            }
            return isIarEnabled;
        }
        return false;
    },

    isDeflectionTrackingEnabled: function() {
        return (gs.getProperty("com.glide.cs.va.deflection_tracking.enable") === "true");
    },

    isAiSearchInitialized: function() {
        return new sn_ais.StatusApi().isAisInitialized();
    },

    isAiSearchEnabled: function() {
        return new sn_ais.StatusApi().isAisEnabled();
    },

    isAiSearchServiceConfigured: function() {
        var grS = new GlideAggregate('sys_service');
        grS.addQuery('name', 'AISearch');
        if (grS.getCount() > 0)
            return true;
        return false;
    },

    isLiveAgentEnabled: function() {
        var chatSetupGr = new GlideRecord('sys_cs_live_agent_setup');
        chatSetupGr.setLimit(1);
        chatSetupGr.query();
        if (chatSetupGr.next()) {
            var liveAgentEnabled = chatSetupGr.getValue('live_agent_enabled');
            return liveAgentEnabled == "1";
        }
        return false;
    },

    getDeflectionConfigDetails: function(sysId) {
        var deflection_configuration_GR = new GlideRecord('ssa_deflection_configuration');
        deflection_configuration_GR.addQuery("sys_id", sysId);
        deflection_configuration_GR.query();
        if (deflection_configuration_GR.next()) {
            return {
                "id": sysId,
                "name": deflection_configuration_GR.getDisplayValue("name")
            };
        }
        return {};
    },

    getActivityPatternDetails: function(sysId) {
        var activityPatternGR = new GlideRecord('ssa_activity_pattern');
        activityPatternGR.addQuery("sys_id", sysId);
        activityPatternGR.query();
        var patternData = {};
        if (activityPatternGR.next()) {
            patternData.name = activityPatternGR.getValue("name");
            patternData.outcome = activityPatternGR.getValue("outcome");
            patternData.activity_table = activityPatternGR.primary_activity.activity_source_table.toString();
            patternData.feed_conditions = activityPatternGR.primary_activity.feed_conditions.getChoices();
        }
        return patternData;
    },

    getRowCount: function(tableName, encodedQuery) {
        if (!tableName) {
            return 0;
        }

        var aggregateGr = new GlideAggregate(tableName);
        if (encodedQuery) {
            aggregateGr.addEncodedQuery(encodedQuery, true);
        }
        aggregateGr.addAggregate('COUNT');
        aggregateGr.query();

        var count = aggregateGr.next() ? aggregateGr.getAggregate('COUNT') : 0;
        return count;
    },

    getLatestVersion: function(scopes) {
        var appDetailsMap = {};
        var appVersionGr = new GlideRecord("sys_app_version");
        appVersionGr.addQuery("block_install", false);
        var queryCondition = appVersionGr.addQuery("scope", scopes[0]);
        queryCondition.addOrCondition("scope", scopes);
        appVersionGr.query();
        while (appVersionGr.next()) {
            var scopeName = appVersionGr.getValue("scope");
            var app = {};
            app.name = appVersionGr.name.toString();
            app.version = appVersionGr.getValue("version");
            if (
                !appDetailsMap.hasOwnProperty(scopeName) ||
                (appDetailsMap.hasOwnProperty(scopeName) &&
                    new sn_appclient.VersionComparator().isUpgrade(
                        appDetailsMap[scopeName].version,
                        app.version
                    ))
            ) {
                appDetailsMap[scopeName] = app;
            }
        }
        return appDetailsMap;
    },

    getLastReviewedDate: function() {
        var dateTimeGr;
        var generalSettingsGR = new GlideRecordSecure("sys_cs_general_settings");
        if (generalSettingsGR.isValid()) {
            generalSettingsGR.query();
            if (generalSettingsGR.next())
                dateTimeGr = new GlideDateTime(generalSettingsGR.sys_updated_on);
        }
        return dateTimeGr.getDate();
    },

    isUpdateAvailable: function(scope) {

        if (!GlidePluginManager.isActive(scope))
            return false;

        var appDetailsMap = {};
        var storeAppGr = new GlideRecord("sys_app_version");
        storeAppGr.addQuery("block_install", false);
        storeAppGr.addQuery("scope", scope);
        storeAppGr.query();
        while (storeAppGr.next()) {
            var scopeName = storeAppGr.getValue("scope");
            var app = {};
            app.name = storeAppGr.name.toString();
            app.version = storeAppGr.getValue("version");
            if (
                !appDetailsMap.hasOwnProperty(scopeName) ||
                (appDetailsMap.hasOwnProperty(scopeName) &&
                    new sn_appclient.VersionComparator().isUpgrade(
                        appDetailsMap[scopeName].version,
                        app.version
                    ))
            ) {
                appDetailsMap[scopeName] = app;
            }
        }
        return Object.keys(appDetailsMap).length ? true : false;
    },

    getDaysPastTheDate: function(dateStr) {
        var todayGdr = new GlideDate();

        var lastReviewedGdr = new GlideDate();
        lastReviewedGdr.setDisplayValue(dateStr);

        var duration = GlideDate.subtract(lastReviewedGdr, todayGdr);
        return duration.getDayPart();
    },

    getDaysPastDateTime: function(dateTimeStr) {
        var dateTime = new GlideDateTime(dateTimeStr);
        var dateStr = dateTime.getDate();

        return this.getDaysPastTheDate(dateStr);
    },

    isBUPluginInstalled: function() {
        return (GlidePluginManager.isActive("com.snc.itsm.virtualagent") ||
            GlidePluginManager.isActive("com.sn_csm.virtualagent") ||
            GlidePluginManager.isActive("com.sn_hr_virtual_agent") ||
            this.isAddtnlBUPluginInstalled());
    },

    isAddtnlBUPluginInstalled: function() {
        return (GlidePluginManager.isActive("com.sn_fsm.virtualagent") ||
            GlidePluginManager.isActive("com.snc.ppm_virtualagent") ||
            GlidePluginManager.isActive("com.sn_lg_virtual_agent") ||
            GlidePluginManager.isActive("com.sn_grc_virt_agent") ||
            GlidePluginManager.isActive("com.glide.isc_virtualagent"));
    },

    isAllBUPluginsInstalled: function() {
        return (GlidePluginManager.isActive("com.snc.itsm.virtualagent") &&
            GlidePluginManager.isActive("com.sn_csm.virtualagent") &&
            GlidePluginManager.isActive("com.sn_hr_virtual_agent") &&
            this.isAllAddtnlBUPluginsInstalled());
    },

    isAllAddtnlBUPluginsInstalled: function() {
        return (GlidePluginManager.isActive("com.sn_fsm.virtualagent") &&
            GlidePluginManager.isActive("com.snc.ppm_virtualagent") &&
            GlidePluginManager.isActive("com.sn_lg_virtual_agent") &&
            GlidePluginManager.isActive("com.sn_grc_virt_agent") &&
            GlidePluginManager.isActive("com.glide.isc_virtualagent"));
    },

    isInStage1: function() {
        var isChatbotInstalled = GlidePluginManager.isActive('com.glide.cs.chatbot');
        return !isChatbotInstalled;
    },

    isInStage2: function() {
        var isChatbotInstalled = GlidePluginManager.isActive('com.glide.cs.chatbot');
        var isBUPluginInstalled = this.isBUPluginInstalled();

        return isChatbotInstalled && !isBUPluginInstalled;
    },

    isInStage3: function() {
        var isChatbotInstalled = GlidePluginManager.isActive('com.glide.cs.chatbot');
        var isBUPluginInstalled = this.isBUPluginInstalled();

        return isChatbotInstalled && isBUPluginInstalled;
    },

    getBreadCrumbPathForRoute: function(route, fields, params) {
        if (!route) {
            return [];
        }

        if (route.endsWith('/')) {
            route = route.slice(0, -1);
        }

        var experiencePath = new sn_oe_sfs.CIListRecordPropsMetadata().EXPERIENCE_PATH;
        var routePath = experiencePath + route;

        if (Array.isArray(fields) && fields.length) {
            fields.forEach(function(field) {
                routePath += '/' + fields[key];
            });
        }

        if (params && Object.keys(params).length) {
            routePath += '/params';
            Object.keys(params).forEach(function(key) {
                if (fields.hasOwnProperty(key)) {
                    routePath += '/' + key + '/' + fields[key];
                }
            });
        }

        return routePath;
    },
    _getRemainingStatusCount: function(items) {
        var count = {
            'total': 0,
            'remaining': 0
        };
        try {
            if (!items) return count;
            var remainingCount = 0;
            items.forEach(function(item) {
                if (item.props_details && item.props_details.status)
                    count.remaining += item.props_details.status == 'start' ? 1 : 0;
                count.total += 1;
            });
            return count;
        } catch (e) {
            return count;
        }
    },
    _getProgressText: function(remaining, total) {
        var pConstants = this.PROGRESS_CARD_CONSTANTS;
        var progressTextMap = pConstants.PROGRESS_TEXT;
        var completed = total - remaining;
        var percentageCompleted = parseInt(completed / total * 100);
        progressTextMap.forEach(function(progressRange) {
            if (percentageCompleted >= progressRange.range[0] && percentageCompleted <= progressRange.range[1]) return progressRange.label;
        });
        return progressTextMap[0].label;
    },
    getChecklistCardItemStatus: function(items) {
        var pConstants = this.PROGRESS_CARD_CONSTANTS;
        var status = this._getRemainingStatusCount(items);
        var response = status.remaining == 0 ? {
            'badge_color': 'positive',
            'badge_label': pConstants.ACHIEVED
        } : {
            'badge_color': 'info',
            'badge_label': sn_i18n.Message.getMessage("sn_oe_sfs", '{remainingCount} remaining', {
                remainingCount: status.remaining.toString()
            }),
        };
        return response;
    },
    getChecklistCardStatus: function(items) {
        var _self = this;
        var cardCount = {
            'total': 0,
            'remaining': 0,
            'progress_text': null,
            'expandedIdx': -1
        };
        items.forEach(function(item, idx) {
            var eachItemStatus = _self._getRemainingStatusCount(item.children);
            cardCount.total += eachItemStatus.total;
            cardCount.remaining += eachItemStatus.remaining;
            if (cardCount.expandedIdx === -1 && eachItemStatus.remaining > 0) {
                cardCount.expandedIdx = idx;
            }
        });
        cardCount.progress_text = _self._getProgressText(cardCount.remaining, cardCount.total);
        return cardCount;
    },

    sortChecklistCardItems: function(items) {
        items.sort(function(block1, block2) {
            if (block1.props_details.status === block2.props_details.status) return parseInt(block1.order) - parseInt(block2.order);
            if (block1.props_details.status === 'skip') return 1;
            if (block2.props_details.status === 'skip') return -1;
            if (block1.props_details.status === 'complete') return 1;
            if (block2.props_details.status === 'complete') return -1;
        });
        return items;
    },

    getContentBlockContext: function(contentBlockId, contextKey) {
        var aceContextUtil = new sn_ace.ACEAppContextUtil();
        var contextBlock = this.safeParse(aceContextUtil.getContentBlockContext(contentBlockId));

        if (contextKey) {
            return contextBlock[contextKey];
        } else {
            return contextBlock;
        }
    },

    setContentBlockContext: function(contentBlockId, contextValuesToSet) {
        if (!contextValuesToSet)
            return;

        var aceContextUtil = new sn_ace.ACEAppContextUtil();
        var contextBlock = this.safeParse(aceContextUtil.getContentBlockContext(contentBlockId));

        for (var property in contextValuesToSet) {
            contextBlock[property] = contextValuesToSet[property];
        }

        aceContextUtil.setContentBlockContext(contentBlockId, contextBlock);
    },

    setCtaCardPropsFromContext: function(ctaCard) {
        if (!ctaCard || !ctaCard.block_id)
            return;

        var cardBlockId = ctaCard.block_id;
        var propsFromContext = this.getContentBlockContext(cardBlockId);

        ctaCard.props_details = ctaCard.props_details || {};
        ctaCard.props_details.dismissed_on = propsFromContext.dismissed_on || '';
        ctaCard.props_details.last_action_on = propsFromContext.last_action_on || '';
        ctaCard.props_details.last_reviewed_on = propsFromContext.last_reviewed_on || '';

        return ctaCard;
    },

    safeParse: function(json) {
        if (!json) {
            return {};
        }

        var isObject = ((typeof json) === 'object');
        if (isObject) {
            return json;
        }

        var isString = (Object.prototype.toString.call(json) === '[object String]');
        if (isString) {
            try {
                return JSON.parse(json);
            } catch (e) {
                return {};
            }
        }
        return {};
    },

    getTopicId: function(topic) {
        if (!topic) return '';
        var gr = new GlideRecord('sys_cb_topic');
        gr.addQuery('name', topic);
        gr.setLimit(1);
        gr.query();
        if (gr.next())
            return gr.getUniqueValue();
        return '';
    },
    isAWAConsoleInStage1: function() {
        var isAWAPluginInstalled = GlidePluginManager.isActive('com.glide.awa');
        return !isAWAPluginInstalled;
    },
    getProductTour: function(appId, table) {
        try {
            var appConfigTable = new sn_ace.ACEAppBuilderMetaData().TABLES.APP_CONFIG;
            var appBuilderUtil = new sn_ace.ACEAppBuilderUtil();
            var _self = this;
            var productTours = appBuilderUtil._getContentBlocks('', {
                'document_table': appConfigTable,
                'document_id': appId,
                'type': this.CI_PRODUCT_TOUR_TYPE
            });
            var productTour = productTours.reduce(function(acc, item) {
                if (item.props_details && item.props_details.target_table && item.props_details.target_table === table) acc = item;
                return acc;
            }, null);
            if (productTour) {
                productTour.children = appBuilderUtil._getContentBlocks(productTour.block_id, {
                    'document_table': appConfigTable,
                    'document_id': appId,
                    'type': this.CI_PRODUCT_TOUR_STEP_TYPE
                });
            }
            return productTour;
        } catch (e) {
            gs.info(e.toString());
            gs.info('Failed fetching product tours for App: ' + appId + ' and table: ' + table);
            return null;
        }
    },
    isAWABUPluginInstalled: function() {
        return GlidePluginManager.isActive('com.snc.incident.awa') ||
            GlidePluginManager.isActive('com.sn_customerservice') ||
            GlidePluginManager.isActive('com.sn_hr_awa');
    },
    isAWAConsoleInStage2: function() {
        var isAWAPluginInstalled = GlidePluginManager.isActive('com.glide.awa');
        return isAWAPluginInstalled && !this.isAWABUPluginInstalled();
    },
    isAWAConsoleInStage3: function() {
        var isAWAPluginInstalled = GlidePluginManager.isActive('com.glide.awa');
        return isAWAPluginInstalled && this.isAWABUPluginInstalled();

    },

    showAWAAffinityCard: function() {
        return GlidePluginManager.isActive('com.glide.awa.agent_affinity');
    },
    showAWAShiftPluginCard: function() {
        return GlidePluginManager.isActive('com.sn_shift_planning');
    },
    showAWAAdvancedSettings: function() {
        return this.showAWAAffinityCard() || this.showAWAShiftPluginCard();
    },
    getAWAHomePlugins: function(payload) {


        var result = {
            availablePlugins: [],
            installedPlugins: []
        };

        payload.forEach(function(item) {
            var link = {
                "label": "",
                "href": "",
                "icon": "open-link-right-outline"
            };
            link.label = item.displayName;
            link.href = item.appLink;
            item.isInstalled = GlidePluginManager.isActive(item.id);
            if (item.isInstalled)
                result.installedPlugins.push(link);
            else
                result.availablePlugins.push(link);
        });

        return result;
    },

    getSSOConfigurationStatus: function() {
        var statusLabel, statusColor, statusIcon, buttonLabel;
        var azureUtils = new sn_now_azure.MSAzureUtils();
        var tenantId = azureUtils.getInstalledTenantID();
        var providerAppUtil = new VACommonProviderAppUtil();
        var providerApp = tenantId ? providerAppUtil.getProviderApplicationDetails(tenantId) : null;
        var providerAppId = providerApp ? providerAppUtil.getProviderApplicationId(tenantId) : null;
        var tenantName = providerApp ? providerApp['name'] : '';
        var appIdRecordId = tenantId && providerAppId ? this.getTeamsAppIdRecordId(providerAppId) : null;
        var buttonLink = gs.getProperty('glide.servlet.uri') + '/sn_now_azure_app_installer.do';
        var appId = providerAppId ? sn_cs.VASystemObject.getCustomAdapterPropertyWithHierarchy('app_id', providerAppId) : null;

        if (tenantId && providerApp && azureUtils.isAppConsented(azureUtils.getAzureAppId('sso')) && appId && appId != '') {
            statusLabel = gs.getMessage('On');
            statusColor = 'positive';
            statusIcon = 'check-outline';
            buttonLabel = 'Manage';
        } else {
            statusLabel = gs.getMessage('Off');
            statusColor = 'gray';
            statusIcon = 'ban-outline';
            buttonLabel = 'Configure SSO';
        }

        return {
            label: statusLabel,
            color: statusColor,
            icon: statusIcon,
            variant: 'secondary',
            tenantName: tenantName,
            tenantId: tenantId,
            buttonLabel: buttonLabel,
            buttonLink: buttonLink,
            recordSysId: appIdRecordId,
            scope: this.getSessionUserScope()
        };
    },
    getTeamsAppIdRecordId: function(providerAppId) {
        var gr = new GlideRecord('sys_cs_custom_adapter_property');

        gr.addQuery('name', 'app_id');
        gr.addQuery('document_record', providerAppId);
        gr.addQuery('document_table', 'sys_cs_provider_application');

        gr.query();

        if (!gr.next()) {
            gr.initialize();
            gr.setValue('name', 'app_id');
            gr.setValue('value', '');
            gr.setValue('document_record', providerAppId);
            gr.setValue('document_table', 'sys_cs_provider_application');
            gr.setValue('sys_scope', '8be385e4776110105d7b3882a910610e'); // setting the scope to Conversational Integration with Micosoft Teams
            gr.insert();
        }

        return gr.getUniqueValue();
    },
    getSessionUserScope: function() {
        var app = new GlideRecord('sys_scope');
        app.get(gs.getSession().getCurrentApplicationId());
        return app.getValue('name');
    },

    getAssistantAgentChatSysIds: function() {
        var agentChatSysIds = [];
        var configAttributeGr = new GlideRecord('sys_now_assist_deployment_config_attributes');
        configAttributeGr.addQuery('name', 'sp_agent_chat_config_sys_id');
        configAttributeGr.query();

        while (configAttributeGr.next()) {
            agentChatSysIds.push(String(configAttributeGr.value));
        }

        return agentChatSysIds;
    },

    getPublicAssistantList: function() {
        var publicAssistants = [];
        var agentChatSysIds = this.getAssistantAgentChatSysIds();
        var agentChatGr = new GlideRecord('sp_agent_chat_config');
        agentChatGr.addQuery('public', true);
        agentChatGr.addQuery('sys_id', 'IN', agentChatSysIds);
        agentChatGr.query();

        while (agentChatGr.next()) {
            publicAssistants.push(agentChatGr.getUniqueValue());
        }

        return publicAssistants;
    },

    getPublicAccessListData: function() {
        if (!GlidePluginManager.isActive('com.glide.cs.genai')) {
            return {
                link: {},
                name: {}
            };
        }
        var linkData = {};
        var nameData = {};
        var publicAssistants = this.getPublicAssistantList();
        var configAttributeGr = new GlideRecord('sys_now_assist_deployment_config_attributes');
        configAttributeGr.addQuery('value', 'IN', publicAssistants);
        configAttributeGr.query();

        while (configAttributeGr.next()) {
            if (configAttributeGr.deployment_config.now_assist_deployment.active) {
                linkData[String(configAttributeGr.value)] = String(configAttributeGr.deployment_config.now_assist_deployment.sys_id);
                nameData[String(configAttributeGr.value)] = String(configAttributeGr.deployment_config.now_assist_deployment.name);
            }
        }

        return {
            link: linkData,
            name: nameData
        };
    },

    createNodeMap: function() {
        var mapNodes = [];
        var entitlementEncodedQuery = this.getNowAssistEntitlementChecks().assistantEntitlementQuery;
        var deploymentGr = new GlideRecord('sys_now_assist_deployment');
        deploymentGr.addEncodedQuery(entitlementEncodedQuery);
        deploymentGr.addQuery('assistant_type', '!=', 'voice');
        deploymentGr.query();

        while (deploymentGr.next()) {
            var deploymentActive = deploymentGr.active == '1';
            var activeString = deploymentActive ? 'on' : 'off';
            var msgArr = [String(deploymentGr.name), activeString, String(deploymentGr.description)];
            mapNodes.push({
                id: deploymentGr.getUniqueValue(),
                tooltipContent: gs.getMessage('<b>{0} ({1})</b><br />{2}', msgArr),
                hideExpandCollapse: deploymentActive,
                viewData: {
                    primaryLabel: String(deploymentGr.name),
                    secondaryLabel: String(deploymentGr.description),
                    status: deploymentActive ? "positive" : "low",
                    icon: "bot-outline"
                }
            });
        }
        return mapNodes;
    },

    createEdgeMap: function() {
        var mapEdges = [];
        var deploymentGroupGr = new GlideRecord('sys_now_assist_deployment_group');
        deploymentGroupGr.query();

        while (deploymentGroupGr.next()) {
            var edge = {};
            edge["id"] = String(deploymentGroupGr.primary_deployment_id.sys_id) + String(deploymentGroupGr.secondary_deployment_id.sys_id);
            edge["sourceId"] = String(deploymentGroupGr.primary_deployment_id.sys_id);
            edge["targetId"] = String(deploymentGroupGr.secondary_deployment_id.sys_id);

            if (!deploymentGroupGr.secondary_deployment_id.active) {
                edge["tooltipContent"] = gs.getMessage("This link is inactive because the assistant is off.");
                edge["style"] = "dashed";
            }
            mapEdges.push(edge);
        }
        return mapEdges;
    },

    /**
     * Get sys_id of active Data Privacy policy for VA channel or null
     */
    _getActiveDataPrivacyPolicyForVA: function() {
        if (!this.isDataPrivacyForVASupported()) {
            return null;
        }
        var gr = new GlideRecordSecure('dp_configuration_domain_separated');
        gr.addQuery('channel', '963a950c7f311210bafd8a636d8665a0');
        gr.addActiveQuery();
        gr.query();
        if (gr.next()) {
            return gr.getValue('sys_id');
        }
        return null;
    },

    checkAssistantMatchesCurrentDomain: function(assistantId) {
        var deploymentGr = new GlideRecord('sys_now_assist_deployment');
        if (deploymentGr.get(assistantId)) {
            return gs.getSession().getCurrentDomainID() != null ? deploymentGr.sys_domain == gs.getSession().getCurrentDomainID() : deploymentGr.sys_domain == 'global';
        }
    },

    getAssistantMapping: function() {
        var napAssistantMap = {};
        var domainAssistantMap = {};
        var deploymentGr = new GlideRecord('sys_now_assist_deployment');
        deploymentGr.query();

        while (deploymentGr.next()) {
            napAssistantMap[deploymentGr.getUniqueValue()] = deploymentGr.assistant_type == 'nap';
            domainAssistantMap[deploymentGr.getUniqueValue()] = this.checkAssistantMatchesCurrentDomain(deploymentGr.getUniqueValue());
        }
        return {
            napAssistantMap: napAssistantMap,
            domainAssistantMap: domainAssistantMap
        };
    },

    getDeploymentListColumns: function() {
        var tableCols = "name,description,relationship_type,active,sys_updated_on";
        var deploymentGr = new GlideRecord('sys_now_assist_deployment');
        deploymentGr.addQuery('sys_domain', '!=', 'global');
        deploymentGr.query();

        if (deploymentGr.next()) {
            tableCols = "name,description,relationship_type,sys_domain,active,sys_updated_on";
        }
        
        return tableCols;
    },

    getChatSetUpRecord: function() {
        var gr = new GlideRecord('sys_cs_live_agent_setup');
        gr.get('name', 'Chat Setup');
        return gr.getValue('sys_id') || 'f0acbc4c5f091300e6333654de7313c8';
    },

    getNowAssistEntitlementChecks: function() {
        var fulfillerEntitlement;
        var platformEntitlement = new sn_entitlement.GlideEntitlementAPI().hasLicenseForArtifact("app_id", "com.sn.now.platform");
        var ecProEntitlement = new sn_entitlement.GlideEntitlementAPI().hasLicenseForArtifact("app_id", "com.sn_nowassist_for_platform_for_employee");
        var assistantEntitlementQuery = '';
        const ciAdminExperience = "2402cfa4c3020110fc869bc8a840ddea";
        const napPlatformAssistant = "7bd9820f14475650f87711349c1171be";

        try {
            fulfillerEntitlement = new sn_nowassist_admin.NowAssistSkillConfig().checkAccessForAssetSubscription(ciAdminExperience, "sys_ux_page_registry");
        } catch (err) {
            gs.error("Unable to check Now Assist Fulfiller licensing: " + err);
            fulfillerEntitlement = false;
        }

        // Hide all assistants if entitlement for Now Assist Fulfiller
        if (!fulfillerEntitlement) {
            assistantEntitlementQuery = 'sys_idISEMPTY';
        }

        // Hide NAP Platform and all NAVA assistants if no Now Assist Platform or EC Pro entitlement
        else if (!platformEntitlement && !ecProEntitlement) {
            assistantEntitlementQuery = 'assistant_type!=nava^sys_id!=' + napPlatformAssistant;
        }

        // Only hide NAP Platform if EC Pro entitlement but no Now Assist Platform entitlement
        else if (!platformEntitlement && ecProEntitlement) {
            assistantEntitlementQuery = 'sys_id!=' + napPlatformAssistant;
        }

        return {
            fulfillerEntitlement: fulfillerEntitlement,
            platformEntitlement: platformEntitlement,
            ecProEntitlement: ecProEntitlement,
            assistantEntitlementQuery: assistantEntitlementQuery
        };
    },

    type: 'CIUtil'
};
