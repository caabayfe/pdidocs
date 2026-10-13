var OnCallConstantsSNC = Class.create();
OnCallConstantsSNC.prototype = {
    initialize: function() {},

    COMMUNICATION_RESPONSE: {
        ACCEPTED: "accepted",
        REJECTED: "rejected",
        ACCEPTED_FROM_OTHER_DEVICE: "accepted_from_other_device",
        REJECTED_FROM_OTHER_DEVICE: "rejected_from_other_device",
        AUTO_ASSIGNED: "auto_assigned",
        INVALID_RESPONSE: "invalid_response"
    },

    COMMUNICATION_RESPONSE_TYPE: {
        ACCEPTED: "accepted",
        REJECTED: "rejected",
        INVALID: "invalid",
        PARTIAL_REJECT: "partial_reject",
        NO_ANSWER: "no_answer"
    },

    COMMUNICATION_CHANNEL: {
        SMS: "sms",
        VOICE: "voice",
        EMAIL: "email",
        DEFAULT: "default",
        SLACK: "slack",
        MOBILE_NOTIFICATION: "mobile_notification",
        TEAMS: 'teams',
        CONFERENCE_ESCALATION: 'conference_escalation'
    },

    TABLES: {
        ON_CALL_MESSAGE_NUMBER: "on_call_message_number",
        ON_CALL_ESCALATION_RESPONSE: "on_call_escalation_response",
        CMN_NOTIF_DEVICE: "cmn_notif_device",
        ON_CALL_COMMUNICATION_CHANNEL_CONFIG: {
            NAME: "on_call_communication_channel_config",
            FIELDS: {
                ACCEPT_KEYWORD: "accept_keyword",
                CATCH_ALL_ACCEPT_INSTRUCTION: "catch_all_accept_instruction",
                CATCH_ALL_ESCALATION_MESSAGE: "catch_all_escalation_message",
                CATCH_ALL_ESCALATION_TITLE: "catch_all_escalation_title",
                CATCH_ALL_MESSAGES: "catch_all_messages",
                CATCH_ALL_REJECT_INSTRUCTION: "catch_all_reject_instruction",
                CHANNEL_TYPE: "channel_type",
                CHANNEL_SUBFLOW: "channel_subflow",
                CHANNEL_DEFAULT: "channel_default",
                DEVICE_ESCALATION_MESSAGE: "device_escalation_message",
                DEVICE_ESCALATION_TITLE: "device_escalation_title",
                TABLE: "table",
                CONDITION: "condition",
                FIELDS: "fields",
                ORDER: "order",
                REJECT_KEYWORD: "reject_keyword",
                SYS_ID: "sys_id",
                USE_CUSTOM_MESSAGES: "use_custom_messages",
                USER_ACCEPT_INSTRUCTION: "user_accept_instruction",
                USER_ESCALATION_MESSAGE: "user_escalation_message",
                USER_ESCALATION_TITLE: "user_escalation_title",
                USER_REJECT_INSTRUCTION: "user_reject_instruction"
            }
        },
        ON_CALL_ESCALATION_COMM: {
            NAME: "on_call_escalation_comm",
            FIELDS: {
                COMMUNICATION_TYPE: "communication_type"
            }
        },
        ON_CALL_COMMUNICATION_TYPE: {
            NAME: "on_call_communication_type",
            FIELDS: {
                SYS_ID: "sys_id",
                TYPE: "type"
            }
        },
        SYS_HUB_FLOW: {
            NAME: "sys_hub_flow",
            FIELDS: {
                INTERNAL_NAME: "internal_name"
            }
        },
        SYS_CHOICE: {
            NAME: "sys_choice",
            FIELDS: {
                NAME: "name",
                ELEMENT: "element",
                LABEL: "label",
                VALUE: "value"
            }
        }
    },

    FIELDS: {
        TRIGGER_USER_FIELD: "trigger_user_field"
    },

    EXTENSION_POINT: {
        ON_CALL_COMMUNICATION_PROVIDER: "OnCallCommunicationProvider",
        ON_CALL_COMMUNICATION: "global.OnCallCommunication"
    },

    ENUM: {
        DEFAULT: "default",
        URI: "URI",
        URI_REF: "URI_REF"
    },

    PROPERTIES: {
        MAX_VARS: 2
    },

    type: "OnCallConstantsSNC"
};
