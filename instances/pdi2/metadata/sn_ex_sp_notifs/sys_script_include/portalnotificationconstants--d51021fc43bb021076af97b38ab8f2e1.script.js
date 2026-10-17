var PortalNotificationConstants = Class.create();
PortalNotificationConstants.prototype = {
    initialize: function() {},
    type: 'PortalNotificationConstants'
};


// TABLES
PortalNotificationConstants.TABLE_NOTIFICATION_CONTENT = "sn_ex_sp_notifs_portal_notification_content";
PortalNotificationConstants.TABLE_NOTIFICATION_CONFIG = "sn_ex_sp_notifs_portal_notification_config";
PortalNotificationConstants.TABLE_NOTIFICATION_CONTENT_CONFIG = "sn_ex_sp_notifs_portal_notification_content_config";
PortalNotificationConstants.TABLE_SP_INSTANCE_MENU = "sp_instance_menu";
PortalNotificationConstants.TABLE_SYS_NOTIFICATION_CLASSIFICATION = "sys_notification_classification";
PortalNotificationConstants.TABLE_SYS_NOTIFICATION = "sys_notification";

// PORTAL SYS_IDS
PortalNotificationConstants.ECBE_PORTAL_SYS_ID = "76f4e3b87fe39210996d28eaec8665f8";
PortalNotificationConstants.EC_PORTAL_SYS_ID = "70cd9f3b734b13001fdae9c54cf6a72f";

// STATES
PortalNotificationConstants.STATE_NEW = 'new';
PortalNotificationConstants.STATE_OPEN = 'opened';
PortalNotificationConstants.STATE_VIEW = 'viewed';

// ORDER
PortalNotificationConstants.ORDER_DEFAULT = '100';
PortalNotificationConstants.ORDER_CRITICAL = '200';

// EVENTS
PortalNotificationConstants.EVENT_CREATE_REMINDER = "sn_ex_sp_notifs.create_reminder";

// ICONS
PortalNotificationConstants.ICON_CRITICAL = "fa-exclamation-triangle";
PortalNotificationConstants.ICON_REMINDER = "fa-clock-o";

PortalNotificationConstants.REMINDER_FIELDS = [
    'user', 'actors', 'action_url', 'content_template', 'content_params',
    'table', 'record', 'event', 'event_param_1', 'event_param_2',
    'notification_content_config', 'notification', 'critical', 'portals', 'order'
];

// NOTIFICATION STATUS
PortalNotificationConstants.CARD_ACTION_MARK_AS_READ = "MARK_AS_READ";
PortalNotificationConstants.CARD_ACTION_MARK_AS_UNREAD = "MARK_AS_UNREAD";
PortalNotificationConstants.CLEAR_NOTIFICATION = "CLEAR_NOTIFICATION";
PortalNotificationConstants.UNDO_CLEAR_NOTIFICATION = "UNDO";
PortalNotificationConstants.CARD_ACTION_REMIND_IN_30_MINS = "REMIND_30_MINS";
PortalNotificationConstants.CARD_ACTION_REMIND_IN_60_MINS = "REMIND_60_MINS";
PortalNotificationConstants.CARD_ACTION_REMIND_NEXT_WEEK = "REMIND_NXT_WEEK";
PortalNotificationConstants.REMINDERS = "REMINDERS";

// Actions
PortalNotificationConstants.CARD_ACTIONS = [{
        "label": gs.getMessage('notification_card_action_read'),
        "enabled": true,
        "inverseLabel": gs.getMessage("Mark as unread"),
        "actions": [],
        "actionName": PortalNotificationConstants.CARD_ACTION_MARK_AS_READ,
        "inverseActionName": PortalNotificationConstants.CARD_ACTION_MARK_AS_UNREAD
    },
    {
        "label": gs.getMessage("Remind me"),
        "enabled": true,
        "actionName": PortalNotificationConstants.REMINDERS,
        "actions": [{
                "label": gs.getMessage("In 30 mins"),
                "actionName": PortalNotificationConstants.CARD_ACTION_REMIND_IN_30_MINS
            },
            {
                "label": gs.getMessage("In 1 hour"),
                "actionName": PortalNotificationConstants.CARD_ACTION_REMIND_IN_60_MINS
            },
            {
                "label": gs.getMessage("Next week"),
                "actionName": PortalNotificationConstants.CARD_ACTION_REMIND_NEXT_WEEK
            }
        ]
    },
    {
        "label": gs.getMessage("Clear notification"),
        "enabled": true,
        "inverseLabel": gs.getMessage("Undo"),
        "actions": [],
        "actionName": PortalNotificationConstants.CLEAR_NOTIFICATION,
        "inverseActionName": PortalNotificationConstants.UNDO_CLEAR_NOTIFICATION = "UNDO"
    }
];

// Cache related constants
PortalNotificationConstants.PORTAL_NOTIFICATION_CACHE = 'sn_ex_sp_notifs_cache';
PortalNotificationConstants.PORTAL_CONFIG_CACHE_PREFIX = "portal_notification_config_";
PortalNotificationConstants.PORTAL_FILTERS_CACHE_PREFIX = "portal_notification_filter_";

// Static Filters
PortalNotificationConstants.PORTAL_STATIC_FILTERS = [{
        "id": "critical",
        "name": gs.getMessage("Critical"),
        "queryString": "critical=true"
    },
    {
        "id": "reminder",
        "name": gs.getMessage("Reminder"),
        "queryString": "reminder=true"
    }
];

// Configs
PortalNotificationConstants.PORTAL_NOTIFICATION_DEFAULT_CONFIG = {
    enable_bell_icon: false,
    enable_badge_count: true,
    show_unread_count: true,
    ga_mark_all_as_read: true,
    ca_mark_as_read: true,
    ca_reminders: true,
    ca_clear_notification: true,
    notification_classification_filters: [],
    static_filters: PortalNotificationConstants.PORTAL_STATIC_FILTERS
};

// RTL Languages
PortalNotificationConstants.RTL_LANGUAGES = ["he", "ar", "fa", "ur", "arc", "ckb", "dv"];
