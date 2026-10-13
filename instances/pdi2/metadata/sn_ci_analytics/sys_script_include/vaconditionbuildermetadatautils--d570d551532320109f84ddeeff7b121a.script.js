var VA_CONVERSATIONS = 'va_conversations';
var VA_USERS = 'va_users';
var TOPIC_FILTERS = 'topic_filters';
var VA_FUNNEL = 'va_funnel';
var TOPIC_FILTERS_FUNNEL = 'topic_filters_funnel';
var TOPIC_NODE_FILTER = 'topic_node_filter';

var VAConditionBuilderMetadataUtils = Class.create();
VAConditionBuilderMetadataUtils.prototype = {
    initialize: function() {},
    parentModelRequired: {
        "va_conversations": ["Events"],
        "va_users": ["Conversation Exists"]
    },
    comparisonModelInternalTableMap: {
        "va_conversations": {
            "Events": "event_properties_%conditionValue%",
            "Topic Nodes": "topic_filters",
            "Completion Status": "topic_filters",
            "Last Visited Node Name": "topic_filters",
            "Selected Value": "topic_node_filter"
        },
        "va_users": {
            "Conversation Exists": "va_conversations"
        },
        "va_funnel": {}
    },

    fieldOperatorRelationships: {
        "is_choice": {
            "base_type": "string",
            "internal_type": "string",
            "operators": [{
                    "display": gs.getMessage("is any of"),
                    "internal": "is any of",
                    "editor": "choice"
                },
                {
                    "display": gs.getMessage("is none of"),
                    "internal": "is none of",
                    "editor": "choice"
                }
            ]
        },
        "contains_choice": {
            "base_type": "string",
            "internal_type": "string",
            "operators": [{
                    "display": gs.getMessage("contains any of"),
                    "internal": "contains any of",
                    "editor": "choice"
                },
                {
                    "display": gs.getMessage("contains all of"),
                    "internal": "contains all of",
                    "editor": "choice"
                }
            ]
        },
        "contains_parent_topic_choice": {
            "base_type": "string",
            "internal_type": "string",
            "operators": [{
                    "display": gs.getMessage("contains any of parent topics"),
                    "internal": "contains any of parent topics",
                    "editor": "choice"
                },
                {
                    "display": gs.getMessage("contains all of parent topics"),
                    "internal": "contains all of parent topics",
                    "editor": "choice"
                }
            ]
        },
        "choice_single_select": {
            "base_type": "string",
            "internal_type": "string",
            "operators": [{
                "display": gs.getMessage("is"),
                "internal": "is",
                "editor": "choice_single"
            }]
        },
        "boolean": {
            "base_type": "boolean",
            "internal_type": "boolean",
            "operators": [{
                "display": gs.getMessage("is"),
                "internal": "is",
                "editor": "boolean"
            }]
        },
        "boolean_is_any": {
            "base_type": "boolean",
            "internal_type": "boolean",
            "operators": [{
                    "display": gs.getMessage("is"),
                    "internal": "is",
                    "editor": "boolean"
                },
                {
                    "editor": "none",
                    "internal": "is anything",
                    "display": gs.getMessage("is anything")
                }
            ]
        },
        "glide_duration": {
            "operators": [{
                    "editor": "glide_duration",
                    "internal": "less than",
                    "display": gs.getMessage("less than")
                },
                {
                    "editor": "glide_duration",
                    "internal": "greater than",
                    "display": gs.getMessage("greater than")
                },
                {
                    "editor": "glide_duration",
                    "internal": "less than or equal to",
                    "display": gs.getMessage("less than or equal to")
                },
                {
                    "editor": "glide_duration",
                    "internal": "greater than or equal to",
                    "display": gs.getMessage("greater than or equal to")
                },
                {
                    "editor": "between_field",
                    "internal": "between",
                    "display": gs.getMessage("between")
                }
            ],
            "base_type": "datetime",
            "internal_type": "glide_duration"
        },
        "integer": {
            "operators": [{
                    "editor": "integer",
                    "internal": "is",
                    "display": gs.getMessage("is")
                },
                {
                    "editor": "integer",
                    "internal": "less than",
                    "display": gs.getMessage("less than")
                },
                {
                    "editor": "integer",
                    "internal": "greater than",
                    "display": gs.getMessage("greater than")
                },
                {
                    "editor": "integer",
                    "internal": "less than or equal to",
                    "display": gs.getMessage("less than or equal to")
                },
                {
                    "editor": "integer",
                    "internal": "greater than or equal to",
                    "display": gs.getMessage("greater than or equal to")
                },
                {
                    "editor": "between_field",
                    "internal": "between",
                    "display": gs.getMessage("between")
                }
            ],
            "base_type": "integer",
            "internal_type": "integer"
        },
        "glide_date_time": {
            "operators": [{
                    "editor": "glide_duration",
                    "internal": "is in the last",
                    "display": gs.getMessage("is in the last")
                },
                {
                    "editor": "glide_date_choice",
                    "internal": "is on",
                    "display": gs.getMessage("is on")
                },
                {
                    "editor": "glide_date_choice",
                    "internal": "is later than",
                    "display": gs.getMessage("is later than")
                },
                {
                    "editor": "glide_date_choice",
                    "internal": "is earlier than",
                    "display": gs.getMessage("is earlier than")
                },
                {
                    "editor": "between_field",
                    "internal": "is in range",
                    "display": gs.getMessage("is in range")
                }
            ],
            "base_type": "datetime",
            "internal_type": "glide_date_time"
        },
        "string": {
            "operators": [{
                    "editor": "string",
                    "internal": "equals to",
                    "display": gs.getMessage("equals to")
                },
                {
                    "editor": "string",
                    "internal": "not equals to",
                    "display": gs.getMessage("not equals to")
                },
                {
                    "editor": "string",
                    "internal": "contains",
                    "display": gs.getMessage("contains")
                }
            ],
            "base_type": "string",
            "internal_type": "string"
        },
        "string_anonymous": {
            "operators": [{
                    "editor": "string",
                    "internal": "equals to",
                    "display": gs.getMessage("equals to")
                },
                {
                    "editor": "string",
                    "internal": "not equals to",
                    "display": gs.getMessage("not equals to")
                },
                {
                    "editor": "string",
                    "internal": "contains",
                    "display": gs.getMessage("contains")
                },
                {
                    "editor": "boolean",
                    "internal": "is anonymous",
                    "display": gs.getMessage("is anonymous")
                }
            ],
            "base_type": "string",
            "internal_type": "string"
        },
        "string_eq": {
            "operators": [{
                "editor": "string",
                "internal": "equals to",
                "display": gs.getMessage("equals to")
            }],
            "base_type": "string",
            "internal_type": "string"
        }
    },

    vaConversationsDotWalkMetadata: {
        "va_conversations": {
            "Channel": {
                "displayValue": gs.getMessage("Channel"),
                "type": "is_choice",
                "parent": "va_conversations"
            },
            "Conversation Time": {
                "displayValue": gs.getMessage("Conversation Time"),
                "type": "glide_date_time",
                "parent": "va_conversations"
            },
            "Duration": {
                "displayValue": gs.getMessage("Duration"),
                "type": "glide_duration",
                "parent": "va_conversations"
            },
            "End State": {
                "displayValue": gs.getMessage("End State"),
                "type": "is_choice",
                "parent": "va_conversations"
            },
            "Events": {
                "displayValue": gs.getMessage("Events"),
                "type": "contains_choice",
                "parent": "va_conversations"
            },
            "Favorite": {
                "displayValue": gs.getMessage("Favorite"),
                "type": "boolean",
                "parent": "va_conversations"
            },
            "Feedback Result": {
                "displayValue": gs.getMessage("Feedback Result"),
                "type": "is_choice",
                "parent": "va_conversations"
            },
            "Language": {
                "displayValue": gs.getMessage("Language"),
                "type": "is_choice",
                "parent": "va_conversations"
            },
            "Message Count": {
                "displayValue": gs.getMessage("Message Count"),
                "type": "integer",
                "parent": "va_conversations"
            },
            "Provider Name": {
                "displayValue": gs.getMessage("Provider Name"),
                "type": "is_choice",
                "parent": "va_conversations"
            },
            "Setup Topic Types": {
                "displayValue": gs.getMessage("Setup Topic Types"),
                "type": "contains_choice",
                "parent": "va_conversations"
            },
            "Topic Blocks": {
                "displayValue": gs.getMessage("Topic Blocks"),
                "type": "contains_parent_topic_choice",
                "parent": "va_conversations"
            },
            "Topic Categories": {
                "displayValue": gs.getMessage("Topic Categories"),
                "type": "contains_choice",
                "parent": "va_conversations"
            },
            "Topic Count": {
                "displayValue": gs.getMessage("Topic Count"),
                "type": "integer",
                "parent": "va_conversations"
            },
            "Topics": {
                "displayValue": gs.getMessage("Topics"),
                "type": "contains_choice",
                "parent": "va_conversations",
                "isReference": true,
                "referenceDataKey": "topic_sub_categories"
            },
            "Type": {
                "displayValue": gs.getMessage("Type"),
                "type": "is_choice",
                "parent": "va_conversations"
            },
            "VA Success": {
                "displayValue": gs.getMessage("VA Success"),
                "type": "boolean",
                "parent": "va_conversations"
            },
        },
        "topic_filters": {
            "Completion Status": {
                "displayValue": gs.getMessage("Completion Status"),
                "type": "boolean_is_any",
                "parent": "topic_filters"
            },
            "Last Visited Node Name": {
                "displayValue": gs.getMessage("Last Visited Node Name"),
                "type": "contains_choice",
                "parent": "topic_filters"
            },
            "Topic Nodes": {
                "displayValue": gs.getMessage("Topic Nodes"),
                "type": "contains_choice",
                "parent": "topic_filters"
            }
        },
        "topic_node_filter": {
            "Selected Value": {
                "displayValue": gs.getMessage("Selected Value"),
                "type": "choice_single_select",
                "parent": "topic_node_filter"
            }
        }
    },

    vaUsersDotWalkMetadata: {
        "va_users": {
            "Hashed User ID": {
                "displayValue": gs.getMessage("Hashed User ID"),
                "type": "string_anonymous",
                "parent": "va_users"
            },
            "User Index": {
                "displayValue": gs.getMessage("User Index"),
                "type": "integer",
                "parent": "va_users"
            },
            "Conversation Exists": {
                "displayValue": gs.getMessage("Conversation Exists"),
                "type": "",
                "parent": "va_users"
            },
            "Channel Count": {
                "displayValue": gs.getMessage("Channel Count"),
                "type": "integer",
                "parent": "va_users"
            },
            "Channels": {
                "displayValue": gs.getMessage("Channels"),
                "type": "contains_choice",
                "parent": "va_users"
            },
            "Conversation Count": {
                "displayValue": gs.getMessage("Conversation Count"),
                "type": "integer",
                "parent": "va_users"
            },
            "Favorite": {
                "displayValue": gs.getMessage("Favorite"),
                "type": "boolean",
                "parent": "va_users"
            },
            "First Conversation Time": {
                "displayValue": gs.getMessage("First Conversation Time"),
                "type": "glide_date_time",
                "parent": "va_users"
            },
            "Language": {
                "displayValue": gs.getMessage("Language"),
                "type": "contains_choice",
                "parent": "va_users"
            },
            "Last Conversation Time": {
                "displayValue": gs.getMessage("Last Conversation Time"),
                "type": "glide_date_time",
                "parent": "va_users"
            },
            "Time in chat": {
                "displayValue": gs.getMessage("Time in chat"),
                "type": "glide_duration",
                "parent": "va_users"
            }
        }
    },

    vaFunnelDotWalkMetadata: {
        "va_funnel": {
            "Conversation Start (1st)": {
                "displayValue": gs.getMessage("Conversation Start (1st)"),
                "type": "",
                "parent": "va_funnel"
            },
            "Conversation Start (Any)": {
                "displayValue": gs.getMessage("Conversation Start (Any)"),
                "type": "",
                "parent": "va_funnel"
            },
            "Event Trigger": {
                "displayValue": gs.getMessage("Event"),
                "type": "choice_single_select",
                "parent": "va_funnel"
            },
            "Topic": {
                "displayValue": gs.getMessage("Topic"),
                "type": "choice_single_select",
                "parent": "va_funnel",
                "isReference": true,
                "referenceDataKey": "topic_sub_categories"
            }
        },
        "topic_filters_funnel": {
            "Topic Nodes": {
                "displayValue": gs.getMessage("Topic Node"),
                "type": "choice_single_select",
                "parent": "topic_filters_funnel"
            }
        },
    },

    /**
     * @param {string} bucketName - Name of table to get the dotwalk metadata from
     * @returns {Object} Metadata for the given bucket.
     */
    getStaticDotwalkMetadata: function(bucketName) {
        switch (bucketName) {
            case VA_CONVERSATIONS:
                {
                    return this.vaConversationsDotWalkMetadata;
                }

            case VA_USERS:
                {
                    var result = {},
                        key;
                    for (key in this.vaUsersDotWalkMetadata) {
                        result[key] = this.vaUsersDotWalkMetadata[key];
                    }
                    for (key in this.vaConversationsDotWalkMetadata) {
                        result[key] = this.vaConversationsDotWalkMetadata[key];
                    }
                    return result;
                }
            case VA_FUNNEL:
                {
                    return this.vaFunnelDotWalkMetadata;
                }

        }
    },

    getFieldOperatorRelationships: function() {
        return this.fieldOperatorRelationships;
    },

    /**
     * @param {string} fieldInternalValue
     * @param {string} bucketName - Name of the table to which the field belongs.
     * @returns {Object} Result fieldMetadata which contains displayValue, type and referenceTable.
     */
    getFieldMetadata: function(fieldInternalValue, bucketName) {
        switch (bucketName) {
            case VA_CONVERSATIONS:
            case TOPIC_FILTERS:
            case TOPIC_NODE_FILTER:
                {
                    return this.vaConversationsDotWalkMetadata[bucketName][fieldInternalValue];
                }

            case VA_USERS:
                {
                    return this.vaUsersDotWalkMetadata[bucketName][fieldInternalValue];
                }
            case VA_FUNNEL:
            case TOPIC_FILTERS_FUNNEL:
                {
                    return this.vaFunnelDotWalkMetadata[bucketName][fieldInternalValue];
                }
            default:
                {
                    // Filter properties case for Event Trigger in funnels
                    if (bucketName.indexOf('event_properties_funnel') > -1) {
                        return {
                            "displayValue": fieldInternalValue,
                            "type": "string_eq",
                            "parent": bucketName
                        };
                    }
                }
        }
    },

    /**
     * @param {string} operatorInternalValue
     * @param {string} fieldType
     * @returns {string} Returns display value of operator with internal value operatorInternalValue
     * that belongs to fieldType
     */
    getOperatorDisplayValue: function(operatorInternalValue, fieldType) {
        if (!fieldType) {
            return '';
        }
        var operators = this.fieldOperatorRelationships[fieldType]['operators'];
        for (var i in operators) {
            if (operators[i]['internal'] === operatorInternalValue) {
                return operators[i]['display'];
            }
        }
    },

    getInternalTableMap: function() {
        return this.comparisonModelInternalTableMap;
    },
    getInternalTableMapMetaData: function() {
        return this.parentModelRequired;
    },

    type: 'VAConditionBuilderMetadataUtils'
};
