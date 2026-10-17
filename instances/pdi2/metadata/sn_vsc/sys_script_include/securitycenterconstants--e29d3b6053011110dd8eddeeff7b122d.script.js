var SecurityCenterConstants = Class.create();
SecurityCenterConstants.prototype = {
    initialize: function() {},

    type: 'SecurityCenterConstants'
};

//sysId's
SecurityCenterConstants.prototype.SCPAJob = "aead645c53911110dd8eddeeff7b12e9";
SecurityCenterConstants.prototype.SCMonthlyJob = "6f3ea65153611110dd8eddeeff7b1240";
SecurityCenterConstants.prototype.HardeningSuite = '833655cc1b94101046e87733cd4bcb4e';
SecurityCenterConstants.prototype.AdminUser = '2831a114c611228501d4ea6c309d626d';
SecurityCenterConstants.prototype.SCUser = '142f16e253011110dd8eddeeff7b125e';
SecurityCenterConstants.prototype.SCPackage = 'a51d46e3f2014110366b10017c5ba675';
SecurityCenterConstants.prototype.SUM_OF_COMPLIANT_HARDENING_SETTING_WEIGHT = '2a7416e118678110f877e53e0f018713';
SecurityCenterConstants.prototype.TOTAL_HARDENING_SETTING_WEIGHT = 'c962526118678110f877e53e0f0187d1';
SecurityCenterConstants.prototype.ADMIN_ROLE_SYS_ID = "2831a114c611228501d4ea6c309d626d";
SecurityCenterConstants.prototype.SC_ADMIN_ROLE_SYS_ID = "c562ee15ff3a2210c212ffffffffff25";
SecurityCenterConstants.prototype.SC_SUITE_TAG = "sys_tags.e97202ce1ba201100fbd1066b04bcb30=e97202ce1ba201100fbd1066b04bcb30";
SecurityCenterConstants.prototype.SC_OOB_SUITES = "532840af20a70110fa9b96e15935cc77,833655cc1b94101046e87733cd4bcb4e,dd0275c0ff6046107497ffffffffffeb,07f135c0ff6046107497ffffffffffd2,5ee171c0ff6046107497ffffffffff6b,f142c8f4db796510dd95b7e8f4961968,a048938f7fb012100e0450546c8665e6";

//Tables
SecurityCenterConstants.prototype.PAJobLogs = "pa_job_logs";
SecurityCenterConstants.prototype.SYS_USER = "sys_user";
SecurityCenterConstants.prototype.SYS_EVENT = "sysevent";
SecurityCenterConstants.prototype.SYS_POLL = "sys_poll";
SecurityCenterConstants.prototype.SC_LOGIN = "sn_vsc_login_event";
SecurityCenterConstants.prototype.SC_IMPERSONATION = "sn_vsc_impersonation_event";
SecurityCenterConstants.prototype.SC_ELEVATION = "sn_vsc_elevation_event";
SecurityCenterConstants.prototype.SC_EXPORT = "sn_vsc_export_event";
SecurityCenterConstants.prototype.SC_EXPORT_SETTING = "sn_vsc_export_setting";
SecurityCenterConstants.prototype.DATA_CLASS = "data_classification";
SecurityCenterConstants.prototype.DICT_CLASS = "m2m_dictionary_dataclass";
SecurityCenterConstants.prototype.USER_HAS_ROLE = "sys_user_has_role";
SecurityCenterConstants.prototype.BEST_PRACTICES_CONFIG = "sn_vsc_best_practice_configurations";
SecurityCenterConstants.prototype.TABLE_PD_ACTIVITY_CONTEXT = "sys_pd_activity_context";
SecurityCenterConstants.prototype.TABLE_PD_CONTEXT = "sys_pd_context";
SecurityCenterConstants.prototype.SECURITY_POLICY = "sn_vsc_security_policy";
SecurityCenterConstants.prototype.SECURITY_POLICY_CONDITION = "sn_vsc_security_policy_condition";
SecurityCenterConstants.prototype.SECURITY_POLICY_ACTION = "sn_vsc_security_policy_action";
SecurityCenterConstants.prototype.SECURITY_POLICY_HISTORY = "sn_vsc_security_policy_execution_history";
SecurityCenterConstants.prototype.SECURITY_POLICY_STATS = "sn_vsc_security_policy_stats";
SecurityCenterConstants.prototype.EVENTS_CRITERIA_TYPE = "events_criteria_type";
SecurityCenterConstants.prototype.SECURITY_POLICY_CONDITIONS_HUB_CATEGORY = "0966fbef532331102385ddeeff7b1216";
SecurityCenterConstants.prototype.SECURITY_POLICY_NOTIFICATIONS_HUB_CATEGORY = "f1363bef532331102385ddeeff7b1268";
SecurityCenterConstants.prototype.SECURITY_TASK = "sn_vsc_security_task";
SecurityCenterConstants.prototype.SECURITY_CENTER_VIEWER_ROLE = "sn_vsc.security_center_viewer";
SecurityCenterConstants.prototype.ADMIN_ROLE = "admin";
SecurityCenterConstants.prototype.SC_ADMIN_ROLE = "sn_vsc.security_center_admin";

//Customer Action Alert Message
SecurityCenterConstants.prototype.PB_COMPLETED_ALERT_MESSAGE = "Due to an upgrade or action restart, there have been updates made to this Customer Action. It was previously completed and now has been reopened with new steps under the previous steps.";
SecurityCenterConstants.prototype.PB_NOT_COMPLETED_ALERT_MESSAGE = "Due to an upgrade, there have been updates made to this Customer Action. It was not previously completed and new steps have been added under the previous steps.";
//Playbook context state values
SecurityCenterConstants.prototype.playbookContextState = {
    IN_PROGRESS : "IN_PROGRESS",
    COMPLETE: "COMPLETE",
    CANCELLED: "CANCELLED"
};

//variables
SecurityCenterConstants.prototype.StartTime = "00:00:00";
SecurityCenterConstants.prototype.EndTime = "23:59:59";
SecurityCenterConstants.prototype.hardening_comparison = "hardening_comparisons";
SecurityCenterConstants.prototype.pollConfig = {
    "hardening_comparisons": {
        "tableName": "sn_vsc_user_comparisons",
        "columnForComparisonValueCheck": "usr_name",
        "comparison_progress_text": "progress",
        "comparison_completed_text": "complete"
    },
    "scan_comparisons": {
        "tableName": "sn_vsc_scan_comparisons",
        "columnForComparisonValueCheck": "scn_comp",
        "comparison_progress_text": "progress",
        "comparison_completed_text": "complete"
    }
};
SecurityCenterConstants.prototype.scan_comparison = "scan_comparisons";
SecurityCenterConstants.prototype.bp_newUser_button_text = "Build a foundation";
SecurityCenterConstants.prototype.bp_normalUser_button_text = "Complete Best Practice";

// SC Events
SecurityCenterConstants.prototype.scEvents = {
    LOGIN_ADMIN: "login_admin",
    LOGIN_SNC: "login_snc",
    SECURITY_ELEVATION: "security_elevation",
    IMPERSONATION: "impersonation",
    EXPORT: "sn_vsc.sc_security_export",
    HP_ROLE_GRANTED: "hp_role_granted",
    SECURITY_TASK_CREATE: "sn_vsc.sc_task.CREATE",
    HARDENING_SCORE_CHANGED: "sn_vsc.sec.hardening.score.changed",
};

// SC Event Tables
SecurityCenterConstants.prototype.scEventToTable = {
    login_admin: "sn_vsc_login_event",
    login_snc: "sn_vsc_login_event",
    security_elevation: "sn_vsc_elevation_event",
    impersonation: "sn_vsc_impersonation_event",
    "sn_vsc.sc_security_export": "sn_vsc_export_event",
    hp_role_granted: "sn_vsc_role_granted_event"
};

// SC encoded reusable queries
SecurityCenterConstants.prototype.bestPracticesEncodedQueries = {
    getAllActiveNotRemovedRecords: "active=true^ORremovedISNOTEMPTY",
    getAllActiveCompletedRecords: "active=true^ORremovedISNOTEMPTY^status=completed",
    getAllActiveInProgressRecords: "active=true^ORremovedISNOTEMPTY^status=in_progress",
    getAllOpenStateRecords: "active=true^ORremovedISNOTEMPTY^status=open",
    sysAuditQueryForRecentlyUpdatedPractice: "tablename=sn_vsc_best_practice_configurations"
};

// security task types
SecurityCenterConstants.prototype.securityTaskType = {
    HARDENING_SCORE_DEVIATION: "hardening_score_deviation",
    NEW_CUSTOMER_ACTION: "new_customer_action",
    NEW_BANNER_ANNOUNCEMENT: "new_banner_announcement",
    EVENT_NOTIFICATION: "event_notification",
    METRICS_THRESHOLD: "metrics_threshold",
    OTHER: "other"
};

//security task priority values
SecurityCenterConstants.prototype.securityTaskPriority = {
    CRITICAL : "1",
    HIGH: "2",
    MODERATE: "3",
    LOW: "4"
};

SecurityCenterConstants.prototype.securityTaskProperty = {
    HARDENING_SCORE_DEVIATION_THRESHOLD: "sn_vsc.security_task.hardening.deviation.threshold"
};
