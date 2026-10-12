var NotificationDashboardConstants = Class.create();
NotificationDashboardConstants.prototype = {
    initialize: function() {
    },

    type: 'NotificationDashboardConstants'
};

NotificationDashboardConstants.NOTIFICATION_NAME = "notificationName";
NotificationDashboardConstants.NOTIFICATION_SYS_ID = "notificationSysId";
NotificationDashboardConstants.TRIGERRED_COUNT = "triggeredCount";
NotificationDashboardConstants.CATEGORY_NAME = "categoryName";
NotificationDashboardConstants.CATEGORY_SYS_ID = "categorySysID";
NotificationDashboardConstants.TABLE_NAME = "tableName";
NotificationDashboardConstants.UNSUBSCRIBED_COUNT = "unsubscribedCount";
NotificationDashboardConstants.USER_NAME = "userName";
NotificationDashboardConstants.USER_SYS_ID = "userSysId";
NotificationDashboardConstants.TABLE_NAME = "tableName";
NotificationDashboardConstants.TABLE_SYS_ID = "tableSysId";
NotificationDashboardConstants.TABLE_LABEL = "tableLabel";
NotificationDashboardConstants.CATEGORY_LABEL = "categoryLabel";

NotificationDashboardConstants.NOTIFICATION_TABLE = "sysevent_email_action";
NotificationDashboardConstants.SUBSCRIPTION_TABLE = "sys_notif_subscription";
NotificationDashboardConstants.USER_TABLE = "sys_user";
NotificationDashboardConstants.TABLE_TABLE = "sys_db_object";
/*
To caculate the number of recipients(users) who received email notifications from a specific notification record is
noted in cmn_notif_message and opt-out from the same is recorded in sys_recipient_notif_preference table. So, we are following the below logic for optout logic
total count = count(distinct user) from cmn_notif_message
opt-out count = count(user) from sys_recipient_notif_preference

*/
NotificationDashboardConstants.PREFERENCE_TABLE = "cmn_notif_message";
NotificationDashboardConstants.RECIPIENT_PREFERENCE_TABLE = "sys_recipient_notif_preference";
NotificationDashboardConstants.CATEGORY_TABLE = "sys_notification_category";

NotificationDashboardConstants.NOTIF_TOTAL_SUBSCRIPTION_COUNT = "notificationTotalSubscriptionCount";
NotificationDashboardConstants.NOTIF_SUBSCRIPTION_OPTOUT_COUNT = "notificationSubscriptionOptOutCount";

NotificationDashboardConstants.NOTIF_TOTAL_PREFERENCE_COUNT = "notificationTotalPreferenceCount";
NotificationDashboardConstants.NOTIF_PREFERENCE_OPTOUT_COUNT = "notificationPreferenceOptOutCount";


NotificationDashboardConstants.EMAIL_INDICATOR = "d377b504ff6c5a10ac42fbd38c4fd9b1";
NotificationDashboardConstants.RECIPIENT_BREAKDOWN = "f6c83944ff6c5a10ac42fbd38c4fd993";
NotificationDashboardConstants.NOTIFICATION_BREAKDOWN = "4a520a4cff6c5a10ac42fbd38c4fd997";
NotificationDashboardConstants.TABLE_BREAKDOWN = "e9828690ff38da10ac42fbd38c4fd983";
NotificationDashboardConstants.CATEGORY_BREAKDOWN = "f6668fdaff34d250ac42fbd38c4fd94a";

NotificationDashboardConstants.UNSUBSCRIBED_FILTER = "c1bfa4040a0a0b8b001eeb0f3f5ee961"; 
