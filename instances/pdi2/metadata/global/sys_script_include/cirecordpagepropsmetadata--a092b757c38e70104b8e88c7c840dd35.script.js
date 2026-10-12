var CIRecordPagePropsMetadata = Class.create();
CIRecordPagePropsMetadata.prototype = {
    initialize: function() {},
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
                'field_label': gs.getMessage('Apply to groups'),
                'field_data_source': (function() {
                    try {
                        return new QuickActionGroupSlushBucketUtility().fetchGroups();
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
                'field_label': gs.getMessage('Training language'),
                'field_data_source': (function() {
                    try {
                        return new AutoResolutionLanguageChoiceListBuilder().getSupportedLanguagesForUIB();
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
                'field_label': gs.getMessage('Apply to groups'),
                'field_data_source': (function() {
                    try {
                        return new QuickActionGroupSlushBucketUtility().fetchGroups();
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
                'field_label': gs.getMessage('Script'),
                'field_data_source': null,
                'field_data': null,
                'field_dependent': null,
                'mandatory': false
            }
        },
        'sys_cs_context_profile': {
            'script': {
                'field_name': 'condition_script',
                'field_label': gs.getMessage('Script'),
                'field_data_source': null,
                'field_data': null,
                'field_dependent': 'condition_mode=advanced',
                'mandatory': false
            }
        },
        'sys_cs_virtual_agent_context': {
            'script': {
                'field_name': 'value',
                'field_label': gs.getMessage('Value'),
                'field_data_source': null,
                'field_data': null,
                'field_dependent': null,
                'mandatory': false
            }
        },
        'sys_cs_survey': {
            'script': {
                'field_name': 'condition_script',
                'field_label': gs.getMessage('Script'),
                'field_data_source': null,
                'field_data': null,
                'field_dependent': 'condition_mode=advanced',
                'mandatory': false
            }
        },
        'sys_cs_context_topic': {
            'script': {
                'field_name': 'condition_script',
                'field_label': gs.getMessage('Script'),
                'field_data_source': null,
                'field_data': null,
                'field_dependent': 'condition_mode=advanced',
                'mandatory': false
            }
        }

    },
    DEFAULT_FORM: 'ci-record',
    DEFAULT_LIST: 'ci-list',
    CUSTOM_TAG: '-custom-',
    DEFAULT_LANDING_ROUTE: 'general',
    DEFAULT_NEW_RECORD_LABEL: gs.getMessage('New Record'),
    DEFAULT_EMPTY_RECORD_LABEL: gs.getMessage('Record'),
    CRUMBS: {
        'general': {
            page: 'general',
            label: gs.getMessage('General'),
        },
        'agent_chat': {
            page: 'agent-chat',
            label: gs.getMessage('Agent Chat'),
        },
        'virtual_agent': {
            page: 'virtual-agent',
            label: gs.getMessage('Virtual Agent'),
        }
    },
    TABLE_METADATA: {
        'quickactions_workspace_action': {
            entry: 'agent_chat',
            title: gs.getMessage('Quick Action Toolbar Controls'),
            heading: gs.getMessage('Quick Action Toolbar Controls'),
            subHeading: gs.getMessage('Determine what quick action shortcuts are available to live agents in the Agent Chat.'),
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
            title: gs.getMessage('Custom Greetings & Setup'),
            heading: gs.getMessage('Custom Greetings & Setup'),
            subHeading: gs.getMessage('Create different chat experiences for your end users based on the context in which they initiate a conversation with Virtual Agent. You can define the structure of a bot conversation (setup topics), an initial set of topics displayed to users (promoted topics) and the AI Search configurations for displaying search results in conversations.'),
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
            title: gs.getMessage('Simulation Configurations'),
            heading: gs.getMessage('Simulation Configurations'),
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
            title: gs.getMessage('Context Variables'),
            heading: gs.getMessage('Context Variables'),
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
            title: gs.getMessage('Chat Surveys'),
            heading: gs.getMessage('Chat Surveys'),
            subHeading: '',
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
            title: gs.getMessage('Context Topic'),
            heading: gs.getMessage('Context Topic'),
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
            title: gs.getMessage('URL Navigation'),
            heading: gs.getMessage('URL Navigation'),
            subHeading: '',
            list_filter: '',
            list_view: 'ci_admin_console',
            form_filter: '',
            form_view: '',
            related_list_table: '',
            custom_form: '',
            custom_list: ''
        },
        'sys_cs_branding_setup': {
            entry: 'general',
            title: gs.getMessage('Branding'),
            heading: gs.getMessage('Branding'),
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
            title: gs.getMessage('Menu Items'),
            heading: gs.getMessage('Menu Items'),
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
            title: gs.getMessage('Topic Recommendations'),
            heading: gs.getMessage('Topic Recommendations'),
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
            title: gs.getMessage('Promoted Topics'),
            heading: gs.getMessage('Promoted Topics'),
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
            title: gs.getMessage('Setup Topics'),
            heading: gs.getMessage('Setup Topics'),
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
            title: gs.getMessage('Search Profiles'),
            heading: gs.getMessage('Search Profiles'),
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
            title: gs.getMessage('Categories'),
            heading: gs.getMessage('Categories'),
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
            title: gs.getMessage('System Messages'),
            heading: gs.getMessage('System Messages'),
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
            title: gs.getMessage('Auto-Resolution Configuration'),
            heading: gs.getMessage('Auto-Resolution Configuration'),
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
            title: gs.getMessage('Natural Language Understanding (NLU)'),
            heading: gs.getMessage(''),
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
            title: gs.getMessage('Natural Language Understanding (NLU)'),
            heading: gs.getMessage(''),
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
            title: gs.getMessage('Auto-Resolution Intent Topic Map'),
            heading: gs.getMessage('Auto-Resolution Intent Topic Map'),
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
            title: gs.getMessage('Auto-Resolution Configuration Language'),
            heading: gs.getMessage('Auto-Resolution Configuration Language'),
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
            title: gs.getMessage('Profanity Settings'),
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
            title: gs.getMessage('Sensitive Data Detection'),
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
        'sys_cs_smart_link': {
            entry: 'general',
            title: gs.getMessage('URL Navigation'),
            heading: '',
            subHeading: '',
            list_filter: '',
            list_view: 'ci_admin_console',
            form_filter: '',
            form_view: 'ci_admin_console',
            related_list_table: '',
            custom_form: '',
            custom_list: 'url-navigation-settings'
        }
    },
    SUPPORTED_TABLES: [
        'sys_cs_branding_setup', 'va_branding_contact_menu', 'sys_cs_virtual_agent_context', 'sys_cs_survey', 'sys_cs_context_topic', 'sys_cs_virtual_agent_context', 'sys_properties',
        'sys_cs_portal_url_mapping', 'sn_topic_recommend_default_setting', 'sys_cs_auto_resolution_configuration', 'sys_cs_auto_resolution_configuration_language', 'sys_cs_auto_resolution_intent_topic_map',
        'sys_cs_auto_resolution_simulation_configuration', 'sys_cs_context_profile', 'sys_cs_context_profile_topic', 'sys_cs_context_profile_promotion', 'sys_cs_context_profile_search', 'quickactions_workspace_action',
        'open_nlu_driver_language', 'sys_cs_nlu_language', 'sys_cs_profane_word', 'sys_sensitive_data_handling_regex', 'conversation_history_filters', 'sys_cs_smart_link'
    ],
    SUPPORTED_TABLES_VIEW: 'ci_admin_console',
    SUPPORTED_TABLES_VIA_PROP: gs.getProperty('com.glide.cs.admin_console.supported_tables', ''),
    BLACKLIST_TAGS_FROM_SUPPORTED_TABLES: ['sys_cs_profane_word', 'sys_sensitive_data_handling_regex'],
    type: 'CIRecordPagePropsMetadata'
};
