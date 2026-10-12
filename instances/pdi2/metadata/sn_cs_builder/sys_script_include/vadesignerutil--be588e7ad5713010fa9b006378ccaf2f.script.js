var VADesignerUtil = Class.create();
VADesignerUtil.prototype = {
    initialize: function() {
    },

    type: 'VADesignerUtil',

	getOneExtendCapabilities: function() {
		var result = [];
		var isOneExtendActive = new GlidePluginManager().isActive('com.glide.one_extend');
		if (!isOneExtendActive)
			return result;

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
		return result;
	},

	getLiveAgentContext: function() {
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
		return results;
	},

	getVirtualAgentContext: function() {
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
		return results;
	},

	getRoles: function() {
		var gr = new GlideRecordSecure('sys_user_role');
		gr.addQuery('name', '!=', 'maint');
		gr.orderBy('name');
		gr.query();
		var results = [];
		while (gr.next()) {
			results.push(gr.getValue('name'));
		}
		return results;
	},

	getCategories: function() {
		var gr = new GlideRecordSecure('sys_cb_topic_category');
		gr.query();
		var results = [];
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
		return results;
	},

	getUserPreferences: function() {
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
            gs.error("Error fetching user preferences: " + error.toString());
            return {};
        }
        return preferences;
    },

	getDisabledIntents: function() {
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
		return results;
	},

	getAnalyticsConfig: function() {
		var endpoint = gs.getProperty('glide.analytics.api_host');
		var appseeEnabled = gs.getProperty('glide.analytics.enabled');
		var enabled = endpoint && appseeEnabled;
		if (!enabled) {
			return { enabled: false };
		}

		var apiKey = gs.getProperty('com.glide.cs.analytics_api_key');
		var authToken = gs.getProperty('com.glide.cs.analytics_auth_token');
		var debugEnabled = gs.getProperty('com.glide.cs.analytics_debug_enabled');
		var instanceId = gs.getProperty('instance_id');
		var instanceUrl = gs.getProperty('glide.servlet.uri');
		var instanceName = gs.getProperty('instance_name');
		var companyCode = gs.getProperty('glide.appcreator.company.code');

		return {
			enabled: true,
			debugEnabled: debugEnabled,
			endpoint: endpoint,
			apiKey: apiKey,
			authToken: authToken,
			instanceId: instanceId,
			instanceUrl: instanceUrl,
			instanceName: instanceName,
			companyCode: companyCode
		};
	},

	isTopicRecommenderEnabled: function () {

		var isTRActive = new GlidePluginManager().isActive('com.snc.va_topic_recommender');
		var isTRInstalled = gs.tableExists('sn_topic_recommend_default_setting');
		var isIntentDiscoveryInstalled = gs.tableExists('sn_nlu_discovery_report_definition');

		return (isTRActive && isTRInstalled && isIntentDiscoveryInstalled);

	},

	isServiceNowNLUAccessible: function() {
		var languages = global.NLUParloIntegrator.getSupportedLanguages() || [];
		return !!languages.length && languages.length > 0;
	},

	isDialogActsSupported: function(nluProvider, nluEnabled) {
		if (!nluProvider || !nluEnabled || !this.hasActiveDialogActsType(nluProvider)) {
			return false;
		}
		var gr = new GlideRecord('open_nlu_driver_language');
		gr.addQuery('driver', nluProvider);
		gr.addQuery('dialog_acts_supported', 'true');
		gr.query();
		return gr.hasNext();
    },

	isDialogActsTypeSupported: function(nluProvider, dialogActsType) {
		if (!dialogActsType || !nluProvider) {
			return false;
		}
		var gr = new GlideRecord('open_nlu_dialog_act_config');
		gr.addQuery('driver', nluProvider);
		gr.addQuery('dialog_act.label', dialogActsType);
		gr.addActiveQuery();
		gr.query();
		return gr.hasNext();
	},

	hasActiveDialogActsType: function(nluProvider) {
		var gr = new GlideRecord('open_nlu_dialog_act_config');
		gr.addQuery('driver', nluProvider);
		gr.addActiveQuery();
		gr.query();
		return gr.hasNext();
	},

	isNowAssistEnabled: function() {
		var isGenAiActive = new GlidePluginManager().isActive('com.glide.cs.genai');
		if (isGenAiActive) {
			try {
				var isNowAssistEnabled = new sn_nowassist_admin.NowAssistConfig().isNowAssistEnabled();
				return isNowAssistEnabled;
			} catch (e) {
				return false;
			}
		}
		return false;
	}
};
