var CIListRecordPropsMetadata = Class.create();
CIListRecordPropsMetadata.prototype = {
    initialize: function() {},
	EXPERIENCE_PATH: '/now/conversation/settings/', 
    SUPPORTED_CUSTOM_FIELDS: {
        /*
         * Configuration for all fields per table which are not supported OOB UIB Forms 
         * Format
         * <table_name>: {
         * 	<[script | slushbucket]>:{
         * 		'field_name': Name of the field in the table
         * 		'field_label': Field label to be displayed in the form,
         * 		'field_data_source': Default list to be populated. Not applicable for script types
         * 	}
         * }
         *
         * Example:
         * 'sys_script_include': {
         *     'script': {
         *         'field_name': 'script',
         *         'field_label': 'Script',
         *         'field_data_source': null
         *     }
         * }
         */

        'quickactions_workspace_action': {
            'slushbucket': {
                'field_name': 'apply_to_groups',
                'field_label': sn_i18n.Message.getMessage("sn_oe_sfs",'Apply to groups'),
                'field_data_source': (function() {
                    try {
                        return new global.QuickActionGroupSlushBucketUtility().fetchGroups();
                    } catch (e) {
                        return [];
                    }
                })(),
                'field_data': null,
                'field_dependent': 'apply_to_all_groups=false',
                'mandatory': false
            }
        },
        'sys_cs_auto_resolution_configuration': {
            'slushbucket': {
                'field_name': 'training_language',
                'field_label': sn_i18n.Message.getMessage("sn_oe_sfs",'Training language'),
                'field_data_source': (function() {
                    try {
                        return new global.AutoResolutionLanguageChoiceListBuilder().getSupportedLanguagesForUIB();
                    } catch (e) {
                        return [];
                    }
                })(),
                'field_data': null,
                'field_dependent': null,
                'mandatory': true
            }
        },
        'quickactions_action': {
            'slushbucket': {
                'field_name': 'apply_to_groups',
                'field_label': sn_i18n.Message.getMessage("sn_oe_sfs",'Apply to groups'),
                'field_data_source': (function() {
                    try {
                        return new global.QuickActionGroupSlushBucketUtility().fetchGroups();
                    } catch (e) {
                        return [];
                    }
                })(),
                'field_data': null,
                'field_dependent': 'apply_to_all_groups=false',
                'mandatory': false
            },
            'script': {
                'field_name': 'script',
                'field_label': sn_i18n.Message.getMessage("sn_oe_sfs",'Script'),
                'field_data_source': null,
                'field_data': null,
                'field_dependent': null,
                'mandatory': false
            }
        },
        'sys_cs_context_profile': {
            'script': {
                'field_name': 'condition_script',
                'field_label': sn_i18n.Message.getMessage("sn_oe_sfs",'Script'),
                'field_data_source': null,
                'field_data': null,
                'field_dependent': 'condition_mode=advanced',
                'mandatory': false
            }
        },
        'sys_cs_virtual_agent_context': {
            'script': {
                'field_name': 'value',
                'field_label': sn_i18n.Message.getMessage("sn_oe_sfs",'Value'),
                'field_data_source': null,
                'field_data': null,
                'field_dependent': null,
                'mandatory': false
            }
        },
        'sys_cs_survey': {
            'script': {
                'field_name': 'condition_script',
                'field_label': sn_i18n.Message.getMessage("sn_oe_sfs",'Script'),
                'field_data_source': null,
                'field_data': null,
                'field_dependent': 'condition_mode=advanced',
                'mandatory': false
            }
        },
        'sys_cs_context_topic': {
            'script': {
                'field_name': 'condition_script',
                'field_label': sn_i18n.Message.getMessage("sn_oe_sfs",'Script'),
                'field_data_source': null,
                'field_data': null,
                'field_dependent': 'condition_mode=advanced',
                'mandatory': false
            }
        },
    },
    DEFAULT_FORM: 'record',
    DEFAULT_LIST: 'list',
    CUSTOM_TAG: '-custom-',
    DEFAULT_LANDING_ROUTE: 'general',
    DEFAULT_NEW_RECORD_LABEL: sn_i18n.Message.getMessage("sn_oe_sfs",'New Record'),
    DEFAULT_EMPTY_RECORD_LABEL: sn_i18n.Message.getMessage("sn_oe_sfs",'Record'),
    CRUMBS: {
        'general': {
            page: 'general',
            label: sn_i18n.Message.getMessage("sn_oe_sfs",'General'),
        },
        'agent_chat': {
            page: 'agent-chat',
            label: sn_i18n.Message.getMessage("sn_oe_sfs",'Agent Chat'),
        },
        'virtual_agent': {
            page: 'virtual-agent',
            label: sn_i18n.Message.getMessage("sn_oe_sfs",'Virtual Agent'),
        },
        'sidebar': {
            page: 'side-bar',
            label: sn_i18n.Message.getMessage("sn_oe_sfs",'Sidebar'),
        }
    },
    TABLE_METADATA: {
        'quickactions_workspace_action': {
            entry: 'agent_chat',
            title: sn_i18n.Message.getMessage("sn_oe_sfs",'Quick Action Toolbar Controls'),
            heading: sn_i18n.Message.getMessage("sn_oe_sfs",'Quick Action Toolbar Controls'),
            subHeading: sn_i18n.Message.getMessage("sn_oe_sfs",'Determine what quick action shortcuts are available to live agents in the Agent Chat.'),
            list_filter: '',
            list_view: '',
            form_filter: '',
            form_view: '',
            related_list_table: '',
            custom_form: '',
            custom_list: ''
        },
        'sys_cs_context_profile': {
            entry: 'virtual_agent',
            title: sn_i18n.Message.getMessage("sn_oe_sfs",'Custom Greetings & Setup'),
            heading: sn_i18n.Message.getMessage("sn_oe_sfs",'Custom Greetings & Setup'),
            subHeading: sn_i18n.Message.getMessage("sn_oe_sfs",'Create different chat experiences for your end users based on the context in which they initiate a conversation with Virtual Agent. You can define the structure of a bot conversation (setup topics), an initial set of topics displayed to users (promoted topics) and the AI Search configurations for displaying search results in conversations.'),
			richDescription: (function() {
				var msg = '<h3>{0}</h3>'.replace('{0}', sn_i18n.Message.getMessage("sn_oe_sfs",'Pick which topics to show for this situation'));
				msg += '<p>{1}</p>'.replace('{1}', sn_i18n.Message.getMessage("sn_oe_sfs",'1. Identify one or more Setup topics to include. Keep in mind that the {{link_tag}} will change for those you select.'));
				
				var linkTag = '<a title="default experience" href="/now/conversation/settings/record/sys_cs_context_profile/3a33973653211010a813ddeeff7b125a" target="_blank" rel="noopener">{0}</a>'.replace('{0}', sn_i18n.Message.getMessage("sn_oe_sfs",'default experience'));

				msg = msg.replace("{{link_tag}}", linkTag);

				msg += '<p>{2}</p>'.replace('{2}', sn_i18n.Message.getMessage("sn_oe_sfs",'2. Select up to six Promoted topics to present to your users when they open Virtual Agent.'));
				msg += '<p>{3}</p>'.replace('{3}', sn_i18n.Message.getMessage("sn_oe_sfs",'3. Define how you want your search results to appear in Virtual Agent under Search mapping. It will be applied whenever AI Search topic block is used and in fallback searches if AI Search as Fallback is enabled.'));

				msg += '<br><br>';
				return msg;
			})(),
            list_filter: '',
            list_view: 'simple_chat_context_profiles',
            form_filter: '',
            form_view: '',
            related_list_table: '',
            custom_form: '',
            custom_list: ''
        },
        'sys_cs_auto_resolution_simulation_configuration': {
            entry: 'virtual_agent',
            title: sn_i18n.Message.getMessage("sn_oe_sfs",'Simulation Configurations'),
            heading: sn_i18n.Message.getMessage("sn_oe_sfs",'Simulation Configurations'),
            subHeading: '',
            list_filter: '',
            list_view: '',
            form_filter: '',
            form_view: '',
            related_list_table: '',
            custom_form: '',
            custom_list: ''
        },
		'sys_cs_dynamic_translation_virtual_agent': {
            entry: 'virtual_agent',
            title: sn_i18n.Message.getMessage("sn_oe_sfs",'Multi-language support'),
            heading: sn_i18n.Message.getMessage("sn_oe_sfs",'Multi-language support'),
            subHeading: sn_i18n.Message.getMessage("sn_oe_sfs",'Activate languages for dynamic translations by installing the language plugin for ServiceNow supported translations or manually add an active language row in the sys_language table for other languages.'),
            list_filter: '',
            list_view: '',
            form_filter: '',
            form_view: '',
            related_list_table: '',
            custom_form: '',
            custom_list: ''
        },
        'sys_language': {
            entry: 'virtual_agent',
            title: sn_i18n.Message.getMessage("sn_oe_sfs",'Multi-language support'),
            heading: '',
            subHeading: '',
            list_filter: '',
            list_view: '',
            form_filter: '',
            form_view: '',
            related_list_table: '',
            custom_form: '',
            custom_list: ''
        },
        'sys_cs_virtual_agent_context': {
            entry: 'general',
            title: sn_i18n.Message.getMessage("sn_oe_sfs",'Context Variables'),
            heading: sn_i18n.Message.getMessage("sn_oe_sfs",'Context Variables'),
            subHeading: '',
            list_filter: 'live_agent_setup=f0acbc4c5f091300e6333654de7313c8',
            list_view: 'ci_admin_console',
            form_filter: '',
            form_view: '',
            related_list_table: '',
            custom_form: '',
            custom_list: ''
        },
        'sys_cs_survey': {
            entry: 'general',
            title: sn_i18n.Message.getMessage("sn_oe_sfs",'Pre-chat surveys'),
            heading: sn_i18n.Message.getMessage("sn_oe_sfs",'Pre-chat surveys'),
            subHeading: sn_i18n.Message.getMessage("sn_oe_sfs",'Capture and store chat-related info to determine a user’s need or to improve VA or live agent support.'),
            list_filter: 'type=prechat^EQ',
            list_view: 'ci_admin_console',
            form_filter: '',
            form_view: '',
            related_list_table: '',
            custom_form: '',
            custom_list: ''
        },
        'sys_cs_context_topic': {
            entry: 'general',
            title: sn_i18n.Message.getMessage("sn_oe_sfs",'Context Topic'),
            heading: sn_i18n.Message.getMessage("sn_oe_sfs",'Context Topic'),
            subHeading: '',
            list_filter: '',
            list_view: 'ci_admin_console',
            form_filter: '',
            form_view: '',
            related_list_table: '',
            custom_form: '',
            custom_list: ''
        },
        'sys_cs_portal_url_mapping': {
            entry: 'general',
            title: sn_i18n.Message.getMessage("sn_oe_sfs",'URL Navigation'),
            heading: sn_i18n.Message.getMessage("sn_oe_sfs",'URL Navigation'),
            subHeading: '',
            list_filter: '',
            list_view: 'ci_admin_console',
            form_filter: '',
            form_view: '',
            related_list_table: '',
            custom_form: '',
            custom_list: 'url-navigation-settings'
        },
        'sys_cs_branding_setup': {
            entry: 'general',
            title: sn_i18n.Message.getMessage("sn_oe_sfs",'Branding'),
            heading: sn_i18n.Message.getMessage("sn_oe_sfs",'Branding'),
            subHeading: '',
            list_filter: '',
            list_view: '',
            form_filter: '',
            form_view: '',
            related_list_table: '',
            custom_form: 'branding-settings',
            custom_list: ''
        },
        'va_branding_contact_menu': {
            entry: 'general',
            title: sn_i18n.Message.getMessage("sn_oe_sfs",'Menu Items'),
            heading: sn_i18n.Message.getMessage("sn_oe_sfs",'Menu Items'),
            subHeading: '',
            list_filter: '',
            list_view: '',
            form_filter: '',
            form_view: '',
            related_list_table: 'branding.sys_cs_branding_setup',
            custom_form: '',
            custom_list: ''
        },
        'sn_topic_recommend_default_setting': {
            entry: 'virtual_agent',
            title: sn_i18n.Message.getMessage("sn_oe_sfs",'Topic Recommendations'),
            heading: sn_i18n.Message.getMessage("sn_oe_sfs",'Topic Recommendations'),
            subHeading: '',
            list_filter: '',
            list_view: '',
            form_filter: '',
            form_view: '',
            related_list_table: '',
            custom_form: '',
            custom_list: ''
        },
        'sys_cs_context_profile_promotion': {
            entry: 'virtual_agent',
            title: sn_i18n.Message.getMessage("sn_oe_sfs",'Promoted Topics'),
            heading: sn_i18n.Message.getMessage("sn_oe_sfs",'Promoted Topics'),
            subHeading: '',
            list_filter: '',
            list_view: '',
            form_filter: '',
            form_view: '',
            related_list_table: 'context_profile.sys_cs_context_profile',
            custom_form: '',
            custom_list: ''
        },
        'sys_cs_context_profile_topic': {
            entry: 'virtual_agent',
            title: sn_i18n.Message.getMessage("sn_oe_sfs",'Setup Topics'),
            heading: sn_i18n.Message.getMessage("sn_oe_sfs",'Setup Topics'),
            subHeading: '',
            list_filter: '',
            list_view: '',
            form_filter: '',
            form_view: '',
            related_list_table: 'context_profile.sys_cs_context_profile',
            custom_form: '',
            custom_list: ''
        },
        'sys_cs_context_profile_search': {
            entry: 'virtual_agent',
            title: sn_i18n.Message.getMessage("sn_oe_sfs",'Search Profiles'),
            heading: sn_i18n.Message.getMessage("sn_oe_sfs",'Search Profiles'),
            subHeading: '',
            list_filter: '',
            list_view: '',
            form_filter: '',
            form_view: '',
            related_list_table: 'context_profile.sys_cs_context_profile',
            custom_form: '',
            custom_list: ''
        },
        'sys_properties_category': {
            entry: 'general',
            title: sn_i18n.Message.getMessage("sn_oe_sfs",'Categories'),
            heading: sn_i18n.Message.getMessage("sn_oe_sfs",'Categories'),
            subHeading: '',
            list_filter: '',
            list_view: '',
            form_filter: '',
            form_view: '',
            related_list_table: '',
            custom_form: '',
            custom_list: ''
        },
        'sys_properties': {
            entry: 'general',
            title: sn_i18n.Message.getMessage("sn_oe_sfs",'System Messages'),
            heading: sn_i18n.Message.getMessage("sn_oe_sfs",'System Messages'),
            subHeading: '',
            list_filter: 'sys_idDYNAMIC2ce328b2537230106d43ddeeff7b12d5',
            list_view: 'ci_admin_console',
            form_filter: '',
            form_view: '',
            related_list_table: '',
            custom_form: '',
            custom_list: ''
        },
        'sys_cs_auto_resolution_configuration': {
            entry: 'virtual_agent',
            title: sn_i18n.Message.getMessage("sn_oe_sfs",'Auto-Resolution Configuration'),
            heading: sn_i18n.Message.getMessage("sn_oe_sfs",'Auto-Resolution Configuration'),
            subHeading: '',
            list_filter: '',
            list_view: 'ci_admin_console',
            form_filter: '',
            form_view: '',
            related_list_table: '',
            custom_form: '',
            custom_list: ''
        },
        'open_nlu_driver_language': {
            entry: 'virtual_agent',
            title: sn_i18n.Message.getMessage("sn_oe_sfs",'Natural Language Understanding (NLU)'),
            heading: sn_i18n.Message.getMessage("sn_oe_sfs",''),
            subHeading: '',
            list_filter: '',
            list_view: '',
            form_filter: '',
            form_view: '',
            related_list_table: '',
            custom_form: '',
            custom_list: 'nlu-setting'
        },
        'sys_cs_nlu_language': {
            entry: 'virtual_agent',
            title: sn_i18n.Message.getMessage("sn_oe_sfs",'Natural Language Understanding (NLU)'),
            heading: sn_i18n.Message.getMessage("sn_oe_sfs",''),
            subHeading: '',
            list_filter: '',
            list_view: '',
            form_filter: '',
            form_view: '',
            related_list_table: '',
            custom_form: '',
            custom_list: 'nlu-setting'
        },
        'sys_cs_auto_resolution_intent_topic_map': {
            entry: 'virtual_agent',
            title: sn_i18n.Message.getMessage("sn_oe_sfs",'Auto-Resolution Intent Topic Map'),
            heading: sn_i18n.Message.getMessage("sn_oe_sfs",'Auto-Resolution Intent Topic Map'),
            subHeading: '',
            list_filter: '',
            list_view: '',
            form_filter: '',
            form_view: '',
            related_list_table: 'ar_configuration.sys_cs_auto_resolution_configuration',
            custom_form: '',
            custom_list: ''
        },
        'sys_cs_auto_resolution_configuration_language': {
            entry: 'virtual_agent',
            title: sn_i18n.Message.getMessage("sn_oe_sfs",'Auto-Resolution Configuration Language'),
            heading: sn_i18n.Message.getMessage("sn_oe_sfs",'Auto-Resolution Configuration Language'),
            subHeading: '',
            list_filter: '',
            list_view: '',
            form_filter: '',
            form_view: '',
            related_list_table: 'configuration.sys_cs_auto_resolution_configuration',
            custom_form: '',
            custom_list: ''
        },
        'sys_cs_profane_word': {
            entry: 'agent_chat',
            title: sn_i18n.Message.getMessage("sn_oe_sfs",'Profanity Settings'),
            heading: '',
            subHeading: '',
            list_filter: '',
            list_view: '',
            form_filter: '',
            form_view: '',
            related_list_table: '',
            custom_form: '',
            custom_list: 'profanity-settings'
        },
        'sys_sensitive_data_handling_regex': {
            entry: 'general',
            title: sn_i18n.Message.getMessage("sn_oe_sfs",'Sensitive Data Detection'),
            heading: '',
            subHeading: '',
            list_filter: '',
            list_view: '',
            form_filter: '',
            form_view: '',
            related_list_table: '',
            custom_form: '',
            custom_list: 'sensitive-data'
        },
        'conversation_history_filters': {
            entry: 'agent_chat',
            title: sn_i18n.Message.getMessage("sn_oe_sfs",'Conversation History Settings'),
            heading: sn_i18n.Message.getMessage("sn_oe_sfs",'Conversation History Settings'),
            subHeading: '',
            list_filter: '',
            list_view: '',
            form_filter: '',
            form_view: '',
            related_list_table: '',
            custom_form: '',
            custom_list: 'conversation-history-settings'
        },
        'sys_cs_smart_link': {
            entry: 'general',
            title: sn_i18n.Message.getMessage("sn_oe_sfs",'URL Navigation'),
            heading: sn_i18n.Message.getMessage("sn_oe_sfs",'Target Location'),
            subHeading: sn_i18n.Message.getMessage("sn_oe_sfs",'Smart Links Documentation'),
            list_filter: '',
            list_view: 'ci_admin_console',
            form_filter: '',
            form_view: '',
            related_list_table: '',
            custom_form: '',
            custom_list: 'url-navigation-settings'
        },
        'sys_cs_consumer_account_context': {
            entry: 'virtual_agent',
            title: sn_i18n.Message.getMessage("sn_oe_sfs",'Conversation Consumer Account Contexts'),
            heading: sn_i18n.Message.getMessage("sn_oe_sfs",'Conversation Consumer Account Contexts'),
            subHeading: '',
            list_filter: '',
            list_view: '',
            form_filter: '',
            form_view: '',
            related_list_table: '',
            custom_form: '',
            custom_list: 'multiple-active-conversation'
        },
        'sys_cs_collab_user_query': {
            entry: 'sidebar',
            title: sn_i18n.Message.getMessage("sn_oe_sfs",'Sidebar Member Query'),
            heading: sn_i18n.Message.getMessage("sn_oe_sfs",'Sidebar Member Query'),
            subHeading: '',
            list_filter: '',
            list_view: '',
            form_filter: '',
            form_view: '',
            related_list_table: '',
            custom_form: '',
            custom_list: ''
        },
        'sys_cs_collab_enabled_table': {
            entry: 'sidebar',
            title: sn_i18n.Message.getMessage("sn_oe_sfs",'Sidebar Enabled Tables'),
            heading: sn_i18n.Message.getMessage("sn_oe_sfs",'Sidebar Enabled Tables'),
            subHeading: '',
            list_filter: '',
            list_view: '',
            form_filter: '',
            form_view: '',
            related_list_table: '',
            custom_form: '',
            custom_list: ''
        },
        'sys_cs_collab_chat_requester': {
            entry: 'sidebar',
            title: sn_i18n.Message.getMessage("sn_oe_sfs",'Sidebar Requester Mapping'),
            heading: sn_i18n.Message.getMessage("sn_oe_sfs",'Sidebar Requester Mapping'),
            subHeading: '',
            list_filter: '',
            list_view: '',
            form_filter: '',
            form_view: '',
            related_list_table: '',
            custom_form: '',
            custom_list: ''
        },
    },
	getCustomTableMetaData: function(table, sysId){
		var tableMetaData = this.TABLE_METADATA[table] || null;
		if(!tableMetaData) return null;
		// placeholder for all customizations
		switch(table){
			case 'sys_cs_context_profile':
				if(sysId){
					var gr = new GlideRecord('sys_cs_context_profile');
					if(gr.get(sysId)){
						tableMetaData.form_view = ((gr.getValue('model_type') === 'llm') || (gr.getValue('model_type') === 'nowassistpanel')) ? 'ci_admin_console_llm': ''
					}
				}
				break;
			default: break;
		}
		return tableMetaData;
	},
    SUPPORTED_TABLES: [
        'sys_cs_branding_setup', 'va_branding_contact_menu', 'sys_cs_virtual_agent_context', 'sys_cs_survey', 'sys_cs_context_topic', 'sys_cs_virtual_agent_context', 'sys_properties',
        'sys_cs_portal_url_mapping', 'sn_topic_recommend_default_setting', 'sys_cs_auto_resolution_configuration', 'sys_cs_auto_resolution_configuration_language', 'sys_cs_auto_resolution_intent_topic_map',
        'sys_cs_auto_resolution_simulation_configuration', 'sys_cs_context_profile', 'sys_cs_context_profile_topic', 'sys_cs_context_profile_promotion', 'sys_cs_context_profile_search', 'quickactions_workspace_action',
        'open_nlu_driver_language', 'sys_cs_nlu_language', 'sys_cs_profane_word', 'sys_sensitive_data_handling_regex', 'conversation_history_filters', 'sys_cs_smart_link', 'sys_cs_dynamic_translation_virtual_agent', 
		'sys_language', 'sys_cs_consumer_account_context', 'sys_cs_collab_user_query', 'sys_cs_collab_enabled_table', 'sys_cs_collab_chat_requester'
    ],
    SUPPORTED_TABLES_VIEW: 'ci_admin_console',
    SUPPORTED_TABLES_VIA_PROP: gs.getProperty('com.glide.cs.admin_console.supported_tables', ''),
    BLACKLIST_TAGS_FROM_SUPPORTED_TABLES: ['sys_cs_profane_word', 'sys_sensitive_data_handling_regex'],
    type: 'CIListRecordPropsMetadata'
};
