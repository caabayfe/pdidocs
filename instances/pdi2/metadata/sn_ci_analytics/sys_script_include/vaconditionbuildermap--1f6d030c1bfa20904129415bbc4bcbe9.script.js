var VAConditionBuilderMap = Class.create();
VAConditionBuilderMap.prototype = {
    initialize: function() {},
    VA_KEY: {
        'field': 'field',
        'operator': 'operator',
        'operator_type': 'type',
        'operator_value': 'internal_value',
        'condition_value': 'conditionValue',
        'children': 'children',
        'comparison_type': 'comparisonType',
        'step_number': 'StepNumber'
    },
    COMPARISON_TYPES: {
        'NEW_QUERY': {
            to: 'and',
            type: 'Array',
        },
        'AND': {
            to: 'and',
            type: 'Array',
        },
        'OR': {
            to: 'or',
            type: 'Array',
        },
        'THAT_HAS': {
            to: 'and',
            type: 'Array',
        },
        'IN_WHICH': {
            to: 'and',
            type: 'Array',
        }
    },
    DEFAULT_OPERATOR: {
        'to': 'eq',
        'type': 'String'
    },
    OPERATORS: {
        'matches': 'eq',
        'is': 'eq',
        'equals to': 'eq',
        'not equals to': 'neq',
        'is not': 'neq',
        'is any of': 'is_any',
        'is all of': 'contains_all',
        'is none of': 'is_not_any',
        'contains all': 'contains_all',
        'contains all of': 'contains_all',
        'contains all of parent topics': 'contains_all',
        'contains any of': 'contains_any',
        'contains any of parent topics': 'contains_any',
        'contains': 'contains',
        'contains any': 'contains_any',
        'is in the last': 'in_last',
        'is in last': 'in_last',
        'is on': 'is on',
        'is later than': 'gt',
        'is earlier than': 'lt',
        'is in range': 'is in range',
        'equals': 'eq',
        'greater than': 'gt',
        'greater than equal': 'gte',
        'greater than or equal to': 'gte',
        'less than': 'lt',
        'less than equal': 'lte',
        'less than or equal to': 'lte',
        'is between': 'is between',
        'is anonymous': 'is anonymous',
        'string contains any of': 'contains_any',
        'string contains all of': 'contains_all',
    },
    COMPARISON_TYPE_DEFAULT: function() {
        return this.COMPARISON_TYPES.AND;
    },
    TABLES: {
        'va_conversations': 'va_conversations',
        'va_users': 'va_users',
        'va_funnels': 'va_funnels'
    },
    FIELDS: {
        'va_conversations': {
            'Self Solve': 'DYNAMIC_PROP',
            'End State': 'DYNAMIC_PROP',
            'Channel Name': 'DYNAMIC_PROP',
            'Feedback Result': 'DYNAMIC_PROP',
            'Topic Category': 'MIXED_TOPIC',
            'Conversation Type': 'DYNAMIC_PROP',
            'Provider Name': 'DYNAMIC_PROP',
            'Setup Topic Type': 'MIXED_TOPIC',
            'Parent Topic Name': 'MIXED_TOPIC',
            'Topic': 'CUSTOM_TOPICS',
            'Events': 'CUSTOM_EVENTS',
            'Duration': 'STANDARD#SessionDuration',
            'Topic Count': 'STANDARD#SessionScreenCount',
            'Language': 'STANDARD#SessionLocale',
            'Message Count': 'STANDARD#SessionActionCount',
            'Favorite': 'STANDARD#IsFavorite',
            'Conversation Time': 'STANDARD#SessionStartTime',
            'Topic Node': 'TOPIC_NODE',
            'Topic Selected Value': 'TOPIC_CHOICE'
        },
        'va_users': {
            'Hashed User ID': 'STANDARD#AppUserId',
            'User Index': 'STANDARD#UserAppIndex',
            'Channel Count': 'STANDARD#UserDeviceCountUnique',
            'Channels': 'STANDARD#UserPlatformProperties.Chat.ChannelNames',
            'Conversation Count': 'STANDARD#UserTotalSessions',
            'Favorite': 'STANDARD#IsFavorite',
            'First Conversation Time': 'STANDARD#UserFirstSessionTime',
            'Language': 'STANDARD#UserPlatformProperties.Chat.Locales',
            'Last Conversation Time': 'STANDARD#UserLastSessionTime',
            'Time in chat': 'STANDARD#UserTotalDuration',
            'Conversation Exists': 'CONVERSATION_QUERY'
        },
        'va_funnels': {
            step_types: {
                'Conversation Start (1st)': {
                    'filter': 'FirstSession',
                    'tagged_enum': 4,
                    'has_value': false
                },
                'Conversation Start (Any)': {
                    'filter': 'SessionStarted',
                    'tagged_enum': 3,
                    'has_value': false
                },
                'Event Trigger': {
                    'filter': 'EventTrigger',
                    'tagged_enum': 1,
                    'has_value': true
                },
                'Topic': {
                    'filter': 'EventTrigger',
                    'tagged_enum': 1,
                    'has_value': true
                },
                'Topic Node': {
                    'filter': 'ScreenView',
                    'tagged_enum': 0,
                    'has_value': true
                }
            },
            base_structure: {
                'StepNumber': 0,
                'Alternatives': []
            },
            alternative_structure: {
                'StepType': '',
                'ExtraValues': {}
            }
        }
    },
    FIELD_ALIAS: {
        'va_conversations': {
            'Channel': 'Channel Name',
            'Setup Topic Types': 'Setup Topic Type',
            'Self-solved': 'Self Solve',
            'VA Success': 'Self Solve',
            'Type': 'Conversation Type',
            'Topic Categories': 'Topic Category',
            'Topic Blocks': 'Parent Topic Name',
            'Topic Nodes': 'Topic Node',
            'Topics': 'Topic',
            'Completion Status': 'Last Node Visited',
            'Selection': 'Selected Value',
            'Last Visited Node Name': 'Last Visited Node Name'
        },
        'va_users': {},
        'va_funnels': {}
    },
    APPSEE_QUERY_PATTERNS: {
        'supported_patterns': {
            'dynamic_prop_eq': 'DYNAMIC_PROP',
            'standard_eq': 'STANDARD',
            'custom_events_eq': 'CUSTOM_EVENTS',
            'mixed_topic_eq': 'MIXED_TOPIC',
            'custom_topic_eq': 'CUSTOM_TOPICS',
            'custom_topic_node_eq': 'TOPIC_NODE',
            'custom_topic_choice_eq': 'TOPIC_CHOICE',
            'conversation_query_eq': 'CONVERSATION_QUERY'
        },
        'definitions': {
            'CONVERSATION_QUERY': {
                'structure': {
                    'session': {
                        'child_match': {}
                    }
                },
                'dotwalk_path': ['session']
            },
            'CUSTOM_EVENTS': {
                'structure': {
                    'SessionCustomEvents': {
                        'nested_match': {
                            'and': []
                        }
                    }
                },
                'dotwalk_path': ['SessionCustomEvents', 'nested_match', 'and'],
                'properties': {
                    'Properties': {
                        'nested_match': {}
                    }
                },
                'properties_dotwalk_path': ['SessionCustomEvents', 'nested_match', 'and[1]', 'Properties']
            },
            'DYNAMIC_PROP': {
                'structure': {
                    'SessionCustomEvents': {
                        'nested_match': {
                            'and': [{
                                    'Name': {
                                        'eq': 'DynamicProperties'
                                    }
                                },
                                {
                                    'Properties': {
                                        'nested_match': {
                                            'and': [{}]
                                        }
                                    }
                                }
                            ]
                        }
                    }
                },
                'dotwalk_path': ['SessionCustomEvents', 'nested_match', 'and[1]', 'Properties', 'nested_match', 'and[0]']
            },
            'MIXED_TOPIC': {
                'maps': {
                    'Topic Category': {
                        'structure': 'name_structure',
                        'dotwalk_path': 'name_dotwalk_path',
                        'dotwalk_last_key': 'Name',
                        'add_internal_field': false,
                    },
                    'Setup Topic Type': {
                        'structure': 'property_structure',
                        'dotwalk_path': 'property_dotwalk_path',
                        'dotwalk_last_key': null,
                        'add_internal_field': true
                    },
                    'Parent Topic Name': {
                        'structure': 'property_structure',
                        'dotwalk_path': 'property_dotwalk_path',
                        'dotwalk_last_key': null,
                        'add_internal_field': true
                    }
                },
                'name_structure': {
                    'SessionCustomEvents': {
                        'nested_match': {
                            'and': [{
                                'Name': {}
                            }]
                        }
                    }
                },
                'name_dotwalk_path': ['SessionCustomEvents', 'nested_match', 'and[0]'],
                'property_structure': {
                    'SessionCustomEvents': {
                        'nested_match': {
                            'and': [{
                                'Properties': {
                                    'nested_match': {
                                        'and': []
                                    }
                                }
                            }]
                        }
                    }
                },
                'property_dotwalk_path': ['SessionCustomEvents', 'nested_match', 'and[0]', 'Properties', 'nested_match'],
                'mixers': {
                    'closed': 'contains_any',
                    'open': 'contains_all'
                }
            },
            'TOPIC_NODE': {
                'structure': {
                    'SessionScreens': {
                        'nested_match': {
                            'and': [{
                                'ScreenId': {}
                            }]
                        }
                    }
                },
                'dotwalk_path': ['SessionScreens', 'nested_match', 'and[0]']
            },
            'TOPIC_CHOICE': {
                'prop_labels': {
                    'type': 'Type',
                    'selected_value': 'Selected Value',
                    'topic_node_id': 'Topic Id'
                },
                'replacer': {
                    'field': 'Events',
                    'operator': {
                        'internal_value': 'is',
                        'type': 'String'
                    }
                },
                'dotwalk_path': ['SessionCustomEvents', 'nested_match', 'and[1]', 'Properties', 'nested_match']
            },
            'CUSTOM_TOPICS': {
                'preset_fields': {
                    'last_visited_node': 'Last Node Visited',
                    'topic_node': 'Topic Node',
                    'selected_value': 'Selected Value',
                    'last_visited_node_name': 'Last Visited Node Name',
                },
                'topic_types': {
                    'topic_only': 'topic_only',
                    'topic_with_completion_status': 'topic_with_completion_status',
                    'topic_with_topic_node': 'topic_with_topic_node',
                    'topic_choice': 'topic_choice',
                    'topic_last_visited_node_name': 'topic_last_visited_node_name'
                },
                'configurations': {
                    'topic_only': [{
                        'field': 'Events'
                    }],
                    'topic_last_visited_node_name': [{
                            'field': 'Events',
                            'children': []
                        },
                        {
                            'field': 'Events',
                            'children': [{
                                'field': 'Last Visited Node Name'
                            }],
                            'operator': {
                                'internal_value': 'is',
                                'type': 'String'
                            },
                        }
                    ],
                    'topic_with_completion_status': [{
                            'field': 'Events',
                            'children': []
                        },
                        {
                            'field': 'Events',
                            'children': [{
                                'field': 'Last Node Visited',
                                'operator': {
                                    'internal_value': 'is',
                                    'type': 'Boolean'
                                }
                            }],
                            'operator': {
                                'internal_value': 'is',
                                'type': 'String'
                            },
                        }
                    ],
                    'topic_with_topic_node': [{
                        'field': 'Topic Node'
                    }],
                    'topic_choice': [{
                            'field': 'Events',
                            'children': []
                        },
                        {
                            'field': 'Topic Selected Value'
                        }
                    ]
                }
            }
        }
    },
    UTILITY_FUNCTIONS: function() {

        function _getDates(str) {
            var result = [],
                prefix = 'javascript:';
            try {
                var splits = str.split('@');
                splits.forEach(function(s) {
                    if (s.startsWith(prefix))
                        result.push(/\d{4}-\d{2}-\d{2}/g.exec(s.replace(prefix, '')));
                });
                return result;
            } catch (e) {
                return null;
            }
        }

        var is_between = function(valueSet) {
            var result = {};
            result.gte = valueSet[0];
            result.lte = valueSet[1];
            return result;
        };

        var dates_between = function(encodedString, operator) {
            var dates = _getDates(encodedString);
            var response = {};
            response[operator] = null;
            switch (operator) {
                case 'in_last':
                    var currentDate = new GlideDateTime();
                    var lte = currentDate.getValue().toString().replace(' ', 'T');

                    var startDate = new GlideDateTime();
                    startDate.setValue(encodedString);
                    var startDateStamp = startDate.getNumericValue();

                    currentDate.subtract(startDateStamp);
                    var gte = currentDate.getValue().toString().replace(' ', 'T');
                    return {
                        'gte': gte,
                        'lte': lte
                    };
                case 'is in range':
                case 'is between':
                case 'is on':
                    return {
                        'gte': (dates[0] + 'T00:00:00'),
                        'lte': (dates[1] + 'T23:59:59')
                    };
                case 'gt':
                    response[operator] = (dates[0] + 'T23:59:59');
                    break;
                case 'lt':
                    response[operator] = (dates[0] + 'T00:00:00');
                    break;

            }
            return response;
        };
        return {
            'is_between': is_between,
            'dates_between': dates_between
        };
    },
    OPERATOR_MODIFIERS: {
        'va_conversations': {
            'SessionStartTime': 'dates_between',
            'SessionActionCount': {
                'is between': 'is_between'
            },
            'SessionScreenCount': {
                'is between': 'is_between'
            },
            'SessionDuration': {
                'is between': 'is_between'
            },
            'Topic Node': {
                'contains_any': function(valueSet) {
                    return {
                        'contains_any': JSON.stringify(valueSet[0])
                    };
                },
                'contains_all': function(valueSet) {
                    return {
                        'contains_all': JSON.stringify(valueSet[0])
                    };
                }
            },
            'IsFavorite': {
                'eq': function(value) {
                    return value ? {
                        'exists': true
                    } : {
                        'not exists': true
                    };
                }
            }
        },
        'va_users': {
            'AppUserId': {
                'is anonymous': function(value) {
                    return value ? {
                        'not exists': true
                    } : {
                        'exists': true
                    };
                }
            },
            'UserDeviceCountUnique': {
                'is between': 'is_between'
            },
            'UserAppIndex': {
                'is between': 'is_between'
            },
            'IsFavorite': {
                'eq': function(value) {
                    return value ? {
                        'exists': true
                    } : {
                        'not exists': true
                    };
                }
            },
            'UserTotalSessions': {
                'is between': 'is_between'
            },
            'UserTotalDuration': {
                'is between': 'is_between'
            },
            'UserPlatformProperties.Chat.Locales': {
                'is_any': function(value) {
                    return {
                        'contains_any': value
                    };
                }
            },
            'UserFirstSessionTime': 'dates_between',
            'UserLastSessionTime': 'dates_between',
        },
        'va_funnels': {}
    },
    type: 'VAConditionBuilderMap'
};
