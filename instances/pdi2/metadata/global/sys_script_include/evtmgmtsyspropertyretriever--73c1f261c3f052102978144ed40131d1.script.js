var EvtMgmtSysPropertyRetriever = Class.create();
EvtMgmtSysPropertyRetriever.prototype = {
    initialize: function() {
        this.EVENT_MANAGEMENT_ALERT_TAG_PREFIX_PROPERTY_NAME = "evt_mgmt.alert_tags_prefix";
        this.EVENT_MANAGEMENT_ALERT_TAG_PREFIX_DEFAULT_VALUE = "t_";

        // Roles
        this.ROLE_AUTOMATION_READ_GLOBAL = "sn_sow_alert_rules.automation_read_global";
        this.ROLE_EVT_MGMT_USER = "evt_mgmt_user";
        this.ROLE_AUTOMATION_READ_NONGLOBAL = "sn_sow_alert_rules.automation_read_nonglobal";
        this.ROLE_EVT_MGMT_INTEGRATION = "evt_mgmt_integration";
        this.ROLE_EVT_MGMT_ADMIN = "evt_mgmt_admin";
        this.ROLE_ADMIN = "admin";
    },
    isAllowedToReadSysProperty: function() {
        var currentUser = gs.getUser();
        return currentUser.hasRole(this.ROLE_AUTOMATION_READ_GLOBAL) ||
            currentUser.hasRole(this.ROLE_EVT_MGMT_USER) ||
            currentUser.hasRole(this.ROLE_AUTOMATION_READ_NONGLOBAL) ||
            currentUser.hasRole(this.ROLE_EVT_MGMT_INTEGRATION) ||
            currentUser.hasRole(this.ROLE_EVT_MGMT_ADMIN) ||
            currentUser.hasRole(this.ROLE_ADMIN);
    },
    getEventManagementAlertTagPrefix: function() {
        if (!this.isAllowedToReadSysProperty()) {
            return null;
        }
        return gs.getProperty(this.EVENT_MANAGEMENT_ALERT_TAG_PREFIX_PROPERTY_NAME,
            this.EVENT_MANAGEMENT_ALERT_TAG_PREFIX_DEFAULT_VALUE);
    },
    type: 'EvtMgmtSysPropertyRetriever'
};
