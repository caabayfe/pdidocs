function getConfig(view, fieldsMap, roles) {
    var sysCsGeneralSettingsGr = null;
    var topicRecommendationsEnabled = false;
    var analyticsEnabled = false;

    var gr = new GlideRecord('sys_cs_general_settings');
    gr.setLimit(1);
    gr.query();
    while (gr.next()) {
        sysCsGeneralSettingsGr = gr;
    }

    var analyticsEndpoint = gs.getProperty('glide.analytics.api_host');
    var appseeEnabled = gs.getProperty('glide.analytics.enabled');
    analyticsEnabled = !!(analyticsEndpoint && appseeEnabled);

    if (view !== 'preview') {
        var isTRActive = new GlidePluginManager().isActive('com.snc.va_topic_recommender');
        var isTRInstalled = gs.tableExists('sn_topic_recommend_default_setting');
        var isIntentDiscoveryInstalled = gs.tableExists('sn_nlu_discovery_report_definition');

        topicRecommendationsEnabled = (isTRActive && isTRInstalled && isIntentDiscoveryInstalled);
    }

    function getChannelSetupStatus(channelName) {
        var isChannelSetup = false;
        var providerAppGr = new GlideRecord('sys_cs_provider_application');
        providerAppGr.query();
        while (providerAppGr.next()) {
            if (providerAppGr.provider.channel.name == channelName) {
                isChannelSetup = true;
            }
        }
        return isChannelSetup;
    }

    var config = {
        ONE_EXTEND_CAPABILITIES: {
            previewWindow: false,
            json: true,
            value: function() {
                var result = [];
                try {
                    var isOneExtendActive = new GlidePluginManager().isActive('com.glide.one_extend');
                    if (!isOneExtendActive) {
                        return JSON.stringify(result);
                    }

                    var allCapabilities = sn_one_extend.OneExtendUtil.getAllCapabilities('Virtual Agent Designer');
                    if (allCapabilities) {
                        for (var i = 0; i < allCapabilities.length; i++) {
                            var capabilityDefinition = {};
                            var capability = allCapabilities[i];
                            capabilityDefinition['id'] = capability.capabilityId;
                            capabilityDefinition['name'] = capability.capabilityName;
                            capabilityDefinition['iconUrl'] = capability.iconUrl;
                            capabilityDefinition['definitionId'] = capability.definitionId;
                            capabilityDefinition['description'] = capability.description;
                            capabilityDefinition['properties'] = capability.properties;
                            result.push(capabilityDefinition);
                        }
                    }
                    return JSON.stringify(result);
                } catch (e) {
                    return JSON.stringify(result);
                }
            }
        },

        LIVE_AGENT_CONTEXT: {
            previewWindow: true,
            json: true,
            value: function() {
                var gr = new GlideRecordSecure('sys_cs_live_agent_setup');
                gr.query();
                var results = [];
                var result;
                while (gr.next()) {
                    result = {
                        name: gr.getValue('name'),
                        enable_virtual_agent: gr.getValue('enable_virtual_agent'),
                        global_queue: gr.getValue('global_queue'),
                        csm_queue: gr.getValue('csm_queue'),
                        csm_fulfiller: gr.getValue('csm_fulfiller'),
                        hr_queue: gr.getValue('hr_queue'),
                        hr_fulfiller: gr.getValue('hr_fulfiller'),
                        itsm_queue: gr.getValue('itsm_queue'),
                        itsm_fulfiller: gr.getValue('itsm_fulfiller')
                    };
                    results.push(result);
                }
                return JSON.stringify(results);
            }
        },

        SN_NLU_ACCESSIBLE: {
            previewWindow: false,
            json: false,
            value: function() {
                var languages = config.NLU_ENABLED.value() && (global.NLUParloIntegrator.getSupportedLanguages() || []);
                return !!languages && !!languages.length && languages.length > 0;
            }
        },

        HAS_AVAILABLE_PLUGIN_TOPICS: {
            previewWindow: false,
            json: false,
            value: function() {
                var hasPluginTopics = false;
                var availablePluginTopicsGr = new GlideRecord('sys_cs_available_virtual_agent_topics');
                availablePluginTopicsGr.setLimit(1);
                availablePluginTopicsGr.query();
                if (availablePluginTopicsGr.next()) {
                    hasPluginTopics = true;
                }
                return hasPluginTopics;
            }
        },

        SESSION_LANGUAGE: {
            previewWindow: true,
            json: false,
            value: function() {
                return gs.getSession().getLanguage();
            }
        },

        USER_IS_TRANSLATION_REQUESTER: {
            previewWindow: true,
            json: false,
            value: function() {
                return gs.hasRole('localization_requestor');
            }
        },

        USER_SYS_ID: {
            previewWindow: true,
            json: false,
            value: function() {
                return gs.getUserID();
            }
        },

        VIRTUAL_AGENT_CONTEXT: {
            previewWindow: true,
            json: true,
            value: function() {
                var gr = new GlideRecordSecure('sys_cs_virtual_agent_context');
                gr.query();
                var results = [];
                var result;
                while (gr.next()) {
                    result = {
                        name: gr.getValue('name'),
                        value: gr.getValue('value'),
                        script_variable: gr.getValue('script_variable')
                    };
                    results.push(result);
                }
                return JSON.stringify(results);
            }
        },

        USER_IS_ADMIN: {
            previewWindow: true,
            json: false,
            value: function() {
                return gs.hasRole('admin');
            }
        },

        USER_IS_MAINT: {
            previewWindow: true,
            json: false,
            value: function() {
                return gs.hasRole('maint');
            }
        },

        NOW_ASSIST_PANEL_ENABLED: {
            previewWindow: true,
            json: false,
            value: function() {
                var isGenAiActive = new GlidePluginManager().isActive('com.glide.cs.genai');
                if (isGenAiActive) {
                    try {
                        var isNowAssistEnabled = new sn_nowassist_admin.NowAssistConfig().isNowAssistEnabled();
                        return isNowAssistEnabled && new sn_nowassist_admin.NowAssistConfig().isNowAssistPanelEnabled();
                    } catch (e) {
                        return false;
                    }
                }
                return false;
            }
        },

        NOW_ASSIST_VA_ENABLED: {
            previewWindow: true,
            json: false,
            value: function() {
                try {
                    return new sn_nowassist_va.NowAssistHelperUtil().isNowAssistVAEnabled();
                } catch (ex) {}
                return false;
            }
        },

        UNIFIED_SEARCH_ENABLED: {
            previewWindow: true,
            json: false,
            value: function() {
                return gs.getProperty('sn_vad_genai.unified_search.enabled', 'false') === 'true';
            }
        },

        PLATFORM_ENTITLEMENT: {
            previewWindow: false,
            json: false,
            value: function() {
                try {
                    var platformEntitlement = new sn_entitlement.GlideEntitlementAPI().hasLicenseForArtifact("app_id", "com.sn.now.platform");
                    return platformEntitlement;
                } catch (e) {
                    return false;
                }
            }
        },

        ECPRO_ENTITLEMENT: {
            previewWindow: false,
            json: false,
            value: function() {
                try {
                    var ecProEntitlement = new sn_entitlement.GlideEntitlementAPI().hasLicenseForArtifact("app_id", "com.sn_nowassist_for_platform_for_employee");
                    return ecProEntitlement;
                } catch (e) {
                    return false;
                }
            }
        },
        SCOPE_NAME: {
            previewWindow: false,
            json: false,
            value: function() {
                var gr = new GlideRecord('sys_scope');
                gr.get(config.APP_ID.value());
                var name = gr.name;
                return gr.name.toString();
            }
        },

        APP_NAME: {
            previewWindow: false,
            json: false,
            value: function() {
                return 'conversation-designer';
            }
        },

        APP_SCOPE: {
            previewWindow: false,
            json: false,
            value: function() {
                return ""; //weird
            }
        },

        SECURE_INPUT_NOT_SUPPORTED_CHANNELS: {
            previewWindow: false,
            json: false,
            value: function() {
                return gs.getProperty('com.glide.cs.va_secure_input_not_supported_channels');
            }
        },

        USER_NAME: {
            previewWindow: false,
            json: false,
            value: function() {
                return gs.getUserName();
            }
        },

        USER_DISPLAY_NAME: {
            previewWindow: false,
            json: false,
            value: function() {
                return gs.getUserDisplayName();
            }
        },

        USER_IS_READ_ONLY: {
            previewWindow: false,
            json: false,
            value: function() {
                return gs.hasRole('snc_read_only');
            }
        },

        USER_IS_TRANSLATION_FULFILLER: {
            previewWindow: false,
            json: false,
            value: function() {
                return gs.hasRole('localization_fulfiller');
            }
        },

        USER_IS_TRANSLATION_EDITOR: {
            previewWindow: false,
            json: false,
            value: function() {
                return gs.hasRole('localization_editor');
            }
        },

        USER_IS_ATF_TEST_DESIGNER: {
            previewWindow: false,
            json: false,
            value: function() {
                return gs.hasRole('atf_test_designer');
            }
        },


        USER_IS_ATF_TEST_ADMIN: {
            previewWindow: false,
            json: false,
            value: function() {
                return gs.hasRole('atf_test_admin');
            }
        },

        SYSTEM_TOPIC_CATEGORY_ID: {
            previewWindow: false,
            json: false,
            value: function() {
                var id;
                var gr = new GlideRecord('sys_cb_topic_category');
                gr.addQuery('name', '_system_');
                gr.query();
                if (gr.next()) {
                    id = gr.getValue('sys_id');
                }
                return id;
            }
        },

        SETUP_TOPIC_CATEGORY_ID: {
            previewWindow: false,
            json: false,
            value: function() {
                var id;
                var gr = new GlideRecord('sys_cb_topic_category');
                gr.addQuery('name', 'Setup Topics');
                gr.query();
                if (gr.next()) {
                    id = gr.getValue('sys_id');
                }
                return id;
            }
        },

        'PREF.DARK_MODE': {
            previewWindow: false,
            json: false,
            value: function() {
                return gs.getUser().getPreference('sn_cs_builder.dark_mode') || 'false';
            }
        },

        LOCALE: {
            previewWindow: false,
            json: false,
            value: function() {
                return gs.getSession().getLanguage();
            }
        },

        INITIAL_TOPIC: {
            previewWindow: false,
            json: false,
            value: function() {
                return "";
            }
        },

        ACCESSIBILITY_ENABLED: {
            previewWindow: false,
            json: false,
            value: function() {
                return gs.getUser().getPreference('glide.ui.accessibility') == 'true';
            }
        },

        NLU_MODEL_BUILDER_ACTIVE: {
            previewWindow: false,
            json: false,
            value: function() {
                return new GlidePluginManager().isActive('com.snc.nlu_studio');
            }
        },

        LANGUAGES: {
            previewWindow: false,
            json: true,
            value: function() {
                var languages = [];
                var languageId;
                var languageName;
                var sessionLanguage = gs.getSession().getLanguage();
                var languageTracker = {};
                var gr = new GlideRecord('sys_choice');
                gr.addQuery('name', 'sys_user');
                gr.addQuery('element', 'preferred_language');
                gr.addNullQuery('inactive').addOrCondition('inactive', false);
                gr.addQuery('language', sessionLanguage);
                gr.addQuery('value', '!=', 'NULL_OVERRIDE');
                gr.query();
                while (gr.next()) {
                    languageId = gr.getValue('value');
                    languageLabel = gr.getValue('label');
                    languages.push({
                        id: languageId,
                        name: languageLabel
                    });
                    languageTracker[languageId] = true;
                }
                gr.initialize();
                gr.addQuery('name', 'sys_user');
                gr.addQuery('element', 'preferred_language');
                gr.addNullQuery('inactive').addOrCondition('inactive', false);
                gr.addQuery('language', 'en');
                gr.addQuery('value', '!=', 'NULL_OVERRIDE');
                gr.query();
                while (gr.next()) {
                    languageId = gr.getValue('value');
                    languageLabel = gr.getValue('label');
                    if (!languageTracker[languageId]) {
                        languages.push({
                            id: languageId,
                            name: languageLabel
                        });
                    }
                }
                return JSON.stringify(languages);
            }
        },

        VA_LANGUAGES: {
            previewWindow: false,
            json: true,
            value: function() {
                var nluProvider = config.NLU_PROVIDER.value();
                if (!nluProvider) {
                    return '[]';
                }
                var languages = [];
                var gr = new GlideRecord('sys_cs_nlu_language');
                gr.addQuery('enabled', true);
                gr.addQuery('language.driver', nluProvider);
                gr.query();
                while (gr.next()) {
                    languages.push(gr.language.code.toString());
                }
                return JSON.stringify(languages);
            }
        },

        NLU_KEYWORDS_ENABLED: {
            previewWindow: false,
            json: false,
            value: function() {
                var enabled = gs.getProperty('com.glide.cs.nlu.keywords.enabled');
                return enabled && enabled.contains('true'); // this prop is so weird
            }
        },

        CHANNELS: {
            previewWindow: false,
            json: true,
            value: function() {
                var channels = new sn_cs.ChannelUtils().getSupportedControls();
                return channels;
            }
        },

        NLU_SUPPORTED_LANGUAGES: {
            previewWindow: false,
            json: true,
            value: function() {
                if (!config.NLU_ENABLED) {
                    return '{}';
                }
                try {
                    var mlServiceResult = sn_ml.MLServiceUtil.fetchGraphQL('query { NLU { supportedLanguages { name, language, intents { entities { isEnabled }} } } }');
                    JSON.parse(mlServiceResult);
                    return mlServiceResult;
                } catch (ex) {
                    return '{}';
                }
            }
        },

        ROLES: {
            previewWindow: false,
            json: true,
            value: function() {
                var gr = new GlideRecordSecure('sys_user_role');
                gr.addQuery('name', '!=', 'maint');
                gr.orderBy('name');
                gr.query();
                var results = [];
                while (gr.next()) {
                    results.push(gr.getValue('name'));
                }
                return JSON.stringify(results);
            }
        },

        USER_HAS_ROLES: {
            previewWindow: false,
            json: true,
            value: function() {
                var userHasRoles = {};
                if (roles) {
                    userHasRoles = roles.reduce(function(acc, role) {
                        acc[role] = gs.hasRole(role);
                        return acc;
                    }, {});
                }
                return JSON.stringify(userHasRoles);
            }
        },

        CATEGORIES: {
            previewWindow: false,
            json: true,
            value: function() {
                var results = [];
                try {
                    var gr = new GlideRecordSecure('sys_cb_topic_category');
                    gr.query();
                    var result;
                    while (gr.next()) {
                        result = {
                            name: gr.getDisplayValue('name'),
                            sys_id: gr.getValue('sys_id'),
                            sys_updated_on: gr.getValue('sys_updated_on'),
                            sys_updated_by: gr.getValue('sys_updated_by'),
                            visible: gr.visible.toString() === 'true'
                        };
                        results.push(result);
                    }
                    return JSON.stringify(results);
                } catch (error) {
                    return JSON.stringify(results);
                }
            }
        },

        MAX_FILE_SIZE: {
            previewWindow: false,
            json: false,
            value: function() {
                var max = gs.getProperty('com.glide.attachment.max_size');
                return max && typeof max === 'string' ? Number(max) : max;
            }
        },

        USER_PREFERENCES: {
            previewWindow: false,
            json: false,
            value: function() {
                var preferences = {};
                try {
                    var userId = gs.getUserID();
                    var gr = new GlideRecordSecure('sys_cb_user_preference');
                    gr.addQuery('user', userId);
                    gr.query();
                    while (gr.next()) {
                        preferences[gr.getValue('preference')] = gr.getValue('value');
                    }
                } catch (error) {
                    gs.error('Error fetching user preferences: ' + error.toString());
                    return {};
                }
                return preferences;
            }
        },

        SN_DISABLED_INTENTS: {
            previewWindow: false,
            json: true,
            value: function() {
                if (config.NLU_PROVIDER_NAME.value() !== 'ServiceNow NLU') {
                    return '[]';
                }
                var gr = new GlideRecord('sys_nlu_intent');
                gr.addQuery('enable', 'false');
                gr.addQuery('model.category', 'virtual_agent');
                gr.query();
                var results = [];
                var result;
                while (gr.next()) {
                    result = {
                        name: gr.getValue('name'),
                        model: gr.model.name.toString()
                    };
                    results.push(result);
                }
                return JSON.stringify(results);
            }
        },

        ANALYTICS_KEY: {
            previewWindow: true,
            json: false,
            value: function() {
                return analyticsEnabled ? gs.getProperty('com.glide.cs.analytics_api_key') : '';
            }
        },

        ANALYTICS_DEBUG_ENABLED: {
            previewWindow: true,
            json: false,
            value: function() {
                var prop = gs.getProperty('com.glide.cs.analytics_debug_enabled') == 'true';
            }
        },

        ANALYTICS_ENABLED: {
            previewWindow: true,
            json: false,
            value: function() {
                return analyticsEnabled;
            }
        },

        ANALYTICS_AUTH: {
            previewWindow: true,
            json: false,
            value: function() {
                return analyticsEnabled ? gs.getProperty('com.glide.cs.analytics_auth_token') : '';
            }
        },

        ANALYTICS_ENDPOINT: {
            previewWindow: true,
            json: false,
            value: function() {
                return analyticsEnabled ? analyticsEndpoint : '';
            }
        },

        INSTANCE_ID: {
            previewWindow: true,
            json: false,
            value: function() {
                return gs.getProperty('instance_id');
            }
        },

        INSTANCE_URL: {
            previewWindow: true,
            json: false,
            value: function() {
                return gs.getProperty('glide.servlet.uri');
            }
        },

        APP_ID: {
            previewWindow: true,
            json: false,
            value: function() {
                return gs.getCurrentApplicationId();
            }
        },

        INSTANCE_NAME: {
            previewWindow: true,
            json: false,
            value: function() {
                return gs.getProperty('instance_name');
            }
        },

        COMPANY_CODE: {
            previewWindow: true,
            json: false,
            value: function() {
                return gs.getProperty('glide.appcreator.company.code');
            }
        },

        LOCALIZATION_FRAMEWORK_ENABLED: {
            previewWindow: true,
            json: false,
            value: function() {
                return new GlidePluginManager().isActive('com.glide.localization_framework.installer');
            }
        },

        NLU_ENABLED: {
            previewWindow: true,
            json: false,
            value: function() {
                return sysCsGeneralSettingsGr.getValue('nlu_enabled') == 1;
            }
        },

        NLU_PROVIDER: {
            previewWindow: true,
            json: false,
            value: function() {
                return sysCsGeneralSettingsGr.getValue('nlu_driver');
            }
        },

        NLU_PROVIDER_NAME: {
            previewWindow: true,
            json: false,
            value: function() {
                return sysCsGeneralSettingsGr.getDisplayValue('nlu_driver');
            }
        },

        VA_LITE_ENABLED: {
            previewWindow: true,
            json: false,
            value: function() {
                var vaFullVersionEnabled = new GlidePluginManager().isActive('com.glide.cs.chatbot');
                return !vaFullVersionEnabled;
            }
        },

        AUTOMATED_TEST_FRAMEWORK_FOR_VA_ENABLED: {
            previewWindow: false,
            json: false,
            value: function() {
                return new GlidePluginManager().isActive('com.glide.cs.atf');
            }
        },

        AUTOMATED_TEST_FRAMEWORK_EXECUTION_ENABLED: {
            previewWindow: false,
            json: false,
            value: function() {
                return gs.getProperty('sn_atf.runner.enabled', 'false') == 'true';
            }
        },

        TOPIC_RECOMMENDATIONS_ENABLED: {
            previewWindow: false,
            json: false,
            value: function() {
                return topicRecommendationsEnabled;
            }
        },

        TOPIC_RECOMMENDATIONS_COUNT: {
            previewWindow: false,
            json: false,
            defaultValue: 0,
            value: function() {
                if (topicRecommendationsEnabled) {
                    var gr = new GlideRecord('sn_nlu_discovery_report_definition');
                    gr.addQuery('status', 'solution_complete');
                    gr.orderByDesc('sys_created_on');
                    gr.query();
                    var latestKey = {};
                    var latestReportIds = [];
                    while (gr.next()) {
                        var key = gr.model + '-' + gr.table;
                        if (!latestKey[key]) {
                            latestKey[key] = true;
                            latestReportIds.push(gr.getValue('sys_id'));
                        }
                    }
                    // Find unviewed reports
                    var statusGr = new GlideRecord('sn_topic_recommend_view_status');
                    statusGr.addQuery('report_id', 'IN', latestReportIds);
                    statusGr.addQuery('report_type', 'analysis');
                    statusGr.addQuery('viewed', false);
                    statusGr.query();
                    var unviewedReportIds = [];
                    while (statusGr.next()) {
                        unviewedReportIds.push(statusGr.getValue('report_id'));
                    }
                    // Count recommendations in unviewed reports
                    var intentGr = new GlideRecord('sn_nlu_discovery_intent');
                    intentGr.addQuery('report.definition', 'IN', unviewedReportIds);
                    intentGr.query();
                    var recommendationCount = intentGr.getRowCount() || 0;
                    return recommendationCount;
                }
                return 0;
            }
        },

        TOPIC_RECOMMENDATIONS_LATEST_REPORT_ID: {
            previewWindow: false,
            json: false,
            value: function() {
                var latestKey = '';
                if (topicRecommendationsEnabled) {
                    var gr = new GlideRecord('sn_nlu_discovery_report_definition');
                    gr.addQuery('status', 'solution_complete');
                    gr.orderByDesc('sys_created_on');
                    gr.setLimit(1);
                    gr.query();

                    if (gr.next()) {
                        latestKey = gr.getValue('sys_id');
                    }
                }
                return latestKey;
            }
        },

        MICROSOFT_TEAMS_ENABLED: {
            previewWindow: false,
            json: false,
            value: function() {
                return getChannelSetupStatus('Teams');
            }
        },

        SLACK_ENABLED: {
            previewWindow: false,
            json: false,
            value: function() {
                return getChannelSetupStatus('Slack');
            }
        },

        DIALOG_ACTS_ENABLED: {
            previewWindow: false,
            json: false,
            value: function() {
                var nluProvider = config.NLU_PROVIDER.value();
                if (!nluProvider || !config.NLU_ENABLED.value()) {
                    return false;
                }
                var dialogActConfigGr = new GlideRecord('open_nlu_dialog_act_config');
                dialogActConfigGr.addQuery('driver', nluProvider);
                dialogActConfigGr.addActiveQuery();
                dialogActConfigGr.query();
                if (!dialogActConfigGr.hasNext()) {
                    return false;
                }


                var gr = new GlideRecord('open_nlu_driver_language');
                gr.addQuery('driver', nluProvider);
                gr.addQuery('dialog_acts_supported', 'true');
                gr.query();
                return gr.hasNext();
            }
        },

        DIALOG_ACTS_MODIFY_ENABLED: {
            previewWindow: false,
            json: false,
            value: function() {
                var nluProvider = config.NLU_PROVIDER.value();
                if (!nluProvider) {
                    return false;
                }
                var gr = new GlideRecord('open_nlu_dialog_act_config');
                gr.addQuery('driver', nluProvider);
                gr.addQuery('dialog_act.label', 'MODIFY');
                gr.addActiveQuery();
                gr.query();
                return gr.hasNext();
            }
        },

        INPUT_COLLECTOR_MAX_NODES: {
            previewWindow: false,
            json: false,
            value: function() {
                return gs.getProperty('com.glide.cs.va_input_collector_max_nodes', 5);
            }
        },

        FDIH_TIMEOUT: {
            previewWindow: false,
            json: false,
            value: function() {
                return gs.getProperty('com.glide.cs.fdih.interactive.timeout', 300);
            }
        },


        MODEL_TYPE_CHOICES: {
            previewWindow: false,
            json: true,
            value: function() {
                var choiceList = GlideChoiceList.getChoiceList('sys_cb_topic', 'model_type');
                var choiceLabels = [];
                var choiceValues = ['llm', 'nlu_keyword'];
                choiceValues.forEach(function(choiceValue) {
                    var choiceLabel = choiceList.getLabelOf(choiceValue);
                    choiceLabels.push({
                        label: choiceLabel,
                        value: choiceValue
                    });
                });
                return JSON.stringify(choiceLabels);
            }
        },

        CONVERSATIONAL_STUDIO_INSTALLED: {
            previewWindow: false,
            json: false,
            value: function() {
                return new GlidePluginManager().isActive('com.sn_conversational_studio');
            }
        },

        WORKFLOW_STUDIO_INSTALLED: {
            previewWindow: false,
            json: false,
            value: function() {
                return new GlidePluginManager().isActive('com.sn_workflow_studio');
            }
        },

        NOW_ASSIST_SKILL_KIT_INSTALLED: {
            previewWindow: false,
            json: false,
            value: function() {
                return new GlidePluginManager().isActive('com.snc.skill_builder');
            }
        },

        NOW_ASSIST_AI_AGENTS_INSTALLED: {
            previewWindow: false,
            json: false,
            value: function() {
                return new GlidePluginManager().isActive('com.snc.sn_aia');
            }
        },

        FULL_HEADER_CARD_SUPPORT_ENABLED: {
            previewWindow: false,
            json: false,
            value: function() {
                return gs.getProperty('com.snc.conversation_builder_full_header_card_support_enabled', 'false') === 'true';
            }
        },

        TABLE_SHOW_LINKS_ENABLED: {
            previewWindow: false,
            json: false,
            value: function() {
                return gs.getProperty('sn_cs_builder.table_show_links_enabled', 'false') === 'true';
            }
        },

        INPUT_NODES_HELP_TEXT_ENABLED: {
            previewWindow: false,
            json: false,
            value: function() {
                return gs.getProperty('com.snc.conversation_builder_help_text_enabled', 'false') === 'true';
            }
        },

        NOW_ASSIST_SELF_SERVICE_ENABLED: {
            previewWindow: false,
            json: false,
            value: function() {
                return new GlidePluginManager().isActive('com.now_assist_self_service');
            }
        },
        AGENTIC_ANALYSIS_VIEW_ENABLED: {
            previewWindow: true,
            json: false,
            value: function() {
                return gs.getProperty('glide.cs.preview.agentic.pipeline.logging.enabled', 'false') === 'true';
            }
        },
        INSTALLED_PLATFORM_TYPE: {
            previewWindow: false,
            json: false,
            value: function() {
                try {
                    var licensingUtil = new sn_convo_studio.ConversationalStudioLicensingUtil();
                    return licensingUtil.getInstalledPlatformType();
                } catch (e) {
                    gs.error('Error getting installed platform type: ' + e.message);
                    return null;
                }
            }
        },
        EXCLUDED_AGENTS: {
            previewWindow: false,
            json: true,
            value: function() {
                try {
                    var excludedRecords = new sn_aia.AIAgentLicensingUtil().getTierExcludedRecords();
                    var excludedAgents = excludedRecords.tierExcludedAgents || [];
                    return JSON.stringify(excludedAgents);
                } catch (e) {
                    gs.error('Error getting excluded agents: ' + e.message);
                    return '[]';
                }
            }
        }
    };


    var keys = Object.keys(config);
    return keys.reduce(function(acc, key) {
        if (fieldsMap && !fieldsMap[key]) {
            return acc;
        }

        var propConfig = config[key];
        if (view !== 'preview' || propConfig.previewWindow) {
            var conf = {
                json: propConfig.json
            };
            if (propConfig.json) {
                conf.defaultValue = propConfig.defaultValue !== undefined ? propConfig.defaultValue : [];
            }

            try {
                var value = propConfig.value();
                conf.value = value;
            } catch (e) {
                conf.value = conf.defaultValue || '';
                gs.warn('Error fetching value for ' + key + ': ' + e);
            }

            acc[key] = conf;
        }
        return acc;
    }, {});
}


var VADConfigUtil = Class.create();
VADConfigUtil.prototype = {
    initialize: function() {},

    type: 'VADConfigUtil',

    load: function(view, fieldsMap, roles) {
        var configView = view || (fieldsMap && fieldsMap.length > 0 ? null : 'main');

        if (typeof fieldsMap === 'string') {
            var fieldsArray = fieldsMap.split(',');
            var fieldsObject = {};
            for (var i = 0; i < fieldsArray.length; i++) {
                fieldsObject[fieldsArray[i]] = true;
            }
            var rolesArray = [];
            if (typeof roles === 'string') {
                rolesArray = roles.split(',');
            }
            return getConfig(configView, fieldsObject, rolesArray);
        }

        return getConfig(configView);
    }
};
