var CIPlugin = (function() {
    return {
        SensitiveDataHandling: function() {
            return _pluginDetails('com.glide.sensitive_data_handling');
        },
        Chatbot: function() {
            return _pluginDetails('com.glide.cs.chatbot');
        },
        AWA: function() {
            return _pluginDetails('com.glide.awa');
        },
        AgentChat: function() {
            return _pluginDetails('com.glide.interaction.awa');
        },
        WalkupExperience: function() {
            return _pluginDetails('com.snc.walkup');
        },
        AWAPerformanceAnalytics: function() {
            return _pluginDetails('com.snc.pa.awa');
        },
        AwaCsm: function() {
            return _pluginDetails('com.sn_customerservice');
        },
        AwaItsm: function() {
            return _pluginDetails('com.snc.incident.awa');
        },
        AwaHrsd: function() {
            return _pluginDetails('com.sn_hr_awa');
        },
        ChatbotLite: function() {
            return _pluginDetails('com.glide.cs.chatbot.lite');
        },
        TopicRecommender: function() {
            return _pluginDetails('com.snc.va_topic_recommender');
        },
        LiveAgentSettings: function() {
            return _pluginDetails('com.glide.cs.live_agent_settings');
        },
        Profanity: function() {
            return _pluginDetails('com.sn.va.profanity');
        },
        QuickActions: function() {
            return _pluginDetails('com.glide.quickactions');
        },
        DynamicTranslation: function() {
            return _pluginDetails('com.glide.cs.dynamic.translation.virtual_agent');
        },
        VAAnalytics: function() {
            return _pluginDetails('sn_ci_analytics');
        },
        IAR: function() {
            return _pluginDetails('com.glide.cs.auto_resolution');
        },
        ConnectSupport: function() {
            return _pluginDetails('com.glide.connect.support');
        },
        CSM: function() {
            return _pluginDetails('com.sn_csm.virtualagent');
        },
        ITSM: function() {
            return _appDetails('134450a0b3781300787162ac16a8dc1e');
        },
        HRSD: function() {
            return _appDetails('c8c5545573d8130000e588e54cf6a71a');
        },
        TR: function() {
            return _appDetails('87c995fd53d21010a813ddeeff7b12e1');
        },
        ProfanityApp: function() {
            return _appDetails('77d07c3b7352201076d81f8afaf6a7bb');
        },
        ConversationalAnalytics: function() {
            return _appDetails('c53ca02a73c310108564b17afef6a7c0');
        },
        ConversationalIntegrationWithWorkplaceFromFacebook: function() {
            return _appDetails('4c5691360f0310105375001ea8767e9c');
        },
        ConversationalIntegrationWithMessengerFromFacebook: function() {
            return _appDetails('85f01c541ba25010bfbd10a61a4bcb99');
        },
        ConversationalIntegrationWithLine: function() {
            return _appDetails('9d4fd88edb3e941062a19d62ba9619bb');
        },
        CIMSTeams: function() {
            return _appDetails('8be385e4776110105d7b3882a910610e');
        },
        CIGoogleChat: function() {
            return _appDetails('06393bb1ff402210f1bbffffffffff37');
        },
        CISlack: function() {
            return _appDetails('a2f8b3a0772110105d7b3882a9106160');
        },
        VirtualAgentApi: function() {
            return _appDetails('62c44c6353311010ad77ddeeff7b120c');
        },
        CI: function() {
            return _appDetails('53b1b0e79761011018b2fa98c253afcc');
        },
        OmnichannelCallback: function() {
            return _appDetails('aeaed24c87478510b4eb52093cbb3563');
        },
        DataPrivacy: function() {
            return _appDetails('5e75a761c313011077cafcf9f040ddb2');
        }
    };

    function _pluginDetails(pluginId) {
        return {
            isActive: function() {
                return _isActive(pluginId);
            },
            getPluginLink: function() {
                return _getPluginSearchLink(pluginId);
            },
            getExactPluginLink: function() {
                return _getExactPluginSearchLink(pluginId);
            }
        };
    }

    function _isActive(pluginId) {
        return GlidePluginManager.isActive(pluginId);
    }

    function _isLegacyPluginManagementEnabled() {
        try {
            return gs.getProperty('com.glide.cs.ci_admin_console.legacy_plugin.enabled', false).toString() === 'true';
        } catch (e) {
            // Could not compute, fallback to classic
            return false;
        }
    }

    function _getAppropriateLink(targetType, pluginId) {
        var links = {
            'legacy': {
                'exact': '/nav_to.do?uri=$allappsmgmt.do?sysparm_search==',
                'search': '/nav_to.do?uri=$allappsmgmt.do?sysparm_search='
            },
            'current': {
                'exact': '/now/app-manager/home/plugin/id/',
                'search': '/now/app-manager/home/search/'
            }
        };
        var linkType = _isLegacyPluginManagementEnabled() ? 'legacy' : 'current';
        if (links[linkType][targetType])
            return links[linkType][targetType] + pluginId;

        // failsafe
        return links[linkType]['search'] + pluginId;
    }

    function _getPluginSearchLink(pluginId) {
        return _getAppropriateLink('search', pluginId);
    }

    function _getExactPluginSearchLink(pluginId) {
        return _getAppropriateLink('exact', pluginId);
    }

    function _appDetails(appId) {
        return {
            getAppLink: function() {
                return _getAppSearchLink(appId);
            }
        };
    }

    function _getAppSearchLink(appId) {
        var url = "https://store.servicenow.com/sn_appstore_store.do#!/store/application/{appId}";
        url = url.replace('{appId}', appId);
        return url;
    }

})();
