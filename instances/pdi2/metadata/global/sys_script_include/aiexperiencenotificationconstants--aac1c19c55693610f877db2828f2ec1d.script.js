var AIExperienceNotificationConstants = Class.create();
    AIExperienceNotificationConstants.prototype = {
        initialize: function() {},
        type: 'AIExperienceNotificationConstants'
    };


    // TABLES
    AIExperienceNotificationConstants.TABLE_NOTIFICATION_CONTENT = "sys_aix_notification_content";
    AIExperienceNotificationConstants.TABLE_NOTIFICATION_CONTENT_CONFIG = "sys_aix_notification_content_config";
    AIExperienceNotificationConstants.TABLE_SYS_NOTIFICATION = "sys_notification";

    // STATES
    AIExperienceNotificationConstants.STATE_NEW = 'new';
    AIExperienceNotificationConstants.STATE_OPEN = 'opened';
    AIExperienceNotificationConstants.STATE_VIEW = 'viewed';

   // ORDER
   AIExperienceNotificationConstants.ORDER_DEFAULT = '100';

    // Configs
    AIExperienceNotificationConstants.AI_PORTAL_NOTIFICATION_DEFAULT_CONFIG = {
      enable_bell_icon: false,
      enable_badge_count: true,
      show_unread_count: true,
      ga_mark_all_as_read: true
    };
