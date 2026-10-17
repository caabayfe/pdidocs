var CAConfig = Class.create();
CAConfig.prototype = {
    initialize: function() {},

    //Batch size require for a request, default set to 1MB
    getBatchSize: function() {
        return gs.getProperty("sn_ci_analytics.ca.batch_size", 1000);
    },

    //Maximum size allowed per request
    getMaxBatchSize: function() {
        var maxSize = this.getBatchSize() * 3;
        return maxSize;
    },

    // Maximum retry for a request before failing it, default set to 3
    getMaxRequestRetry: function() {
        return gs.getProperty("sn_ci_analytics.ca.max_retry", 3);
    },

    // Application table name
    getAppTableName: function() {
        return gs.getProperty("sn_ci_analytics.ca.app_table_name", "sn_ci_analytics_application");
    },

    // Application record sys_id for Virtual Agent(Default)
    getAppRecordSysId: function() {
        return gs.getProperty("sn_ci_analytics.ca.app_record_sysid", "879230a7730310108564b17afef6a7ae");
    },

    getJobMaxConversationCount: function() {
        return gs.getProperty("sn_ci_analytics.ca.job_max_conversation_count", 1000);
    },

    isFunnelCreationAllowed: function() {
        return gs.getProperty("sn_ci_analytics.enable_funnel_creation", false);
    },

    getDetails: function() {
        return {
            "sn_ci_analytics.ca.batch_size": this.getBatchSize(),
            "sn_ci_analytics.ca.max_retry": this.getMaxRequestRetry(),
            "sn_ci_analytics.ca.app_table_name": this.getAppTableName(),
            "sn_ci_analytics.ca.app_record_sysid": this.getAppRecordSysId(),
            "sn_ci_analytics.ca.job_max_conversation_count": this.getJobMaxConversationCount(),
            "sn_ci_analytics.ca.reason_max_length": this.getReasonMaxLength(),
            "sn_ci_analytics.etl.open_conversation_threshold_days": this.getOpenStateConversationDays()
        };
    },

    getReasonMaxLength: function() {
        return gs.getProperty('sn_ci_analytics.ca.reason_max_length', 1000);
    },

    getOpenStateConversationDays: function() {
        return gs.getProperty('sn_ci_analytics.etl.open_conversation_threshold_days', 5);
    },

    isAnalyticsProcessingEnabled: function() {
        return gs.getProperty('sn_ci_analytics.ca.processing_enabled', true);
    },

    enableAnalyticsProcessing: function() {
        return gs.setProperty('sn_ci_analytics.ca.processing_enabled', true);
    },

    disableAnalyticsProcessing: function() {
        return gs.setProperty('sn_ci_analytics.ca.processing_enabled', false);
    },

    isParJobEnabled: function() {
        return gs.getProperty('sn_ci_analytics.ca.par_job_enabled', true);
    },

    isAppseeDashboardEnabled: function() {
        return gs.getProperty('sn_ci_analytics.ca.enable_appsee_dashboard', false) == "true";
    },

    supportLegacyDashboard: function() {
        return gs.tableExists('sn_ci_analytics_st_actionable_notifications') || this.isAppseeDashboardEnabled();
    },

    isAppseeAvailable: function() {
        var analyticsSettings = sn_app_analytics.SNAnalytics.retrieveSettings(this.getAppTableName(), this.getAppRecordSysId());
        var isAnalyticsEnabled = sn_app_analytics.SNAnalytics.isEnabled();
        return isAnalyticsEnabled && analyticsSettings.isEnabled();
    },

    isETLForceEnabled: function() {
        return gs.getProperty('sn_ci_analytics.ca.force_enable_etl', false) == "true";
    },

    canRunETL: function() {
        /*
        1. ETL should not run by default to GCC customer.
        2. ETL should run to GCC by sys_prop - backup prop
        3. For commercial customer ETL should run
        */
        return (this.isAppseeAvailable() || this.isETLForceEnabled()) && (this.isAnalyticsProcessingEnabled() == "true");
    },

    showAnalyticsModule: function() {
        var _self = this;
        var isNowassistVAInstalled = GlidePluginManager.isActive('sn_nowassist_va');
        var isParDashboardEnabled = _self.isParDashboardEnabled();
        return isNowassistVAInstalled || isParDashboardEnabled;
    },
    isParDashboardEnabled: function() {
        var isAppseeEnabled = sn_app_analytics.SNAnalytics.isEnabled();
        var isParEnabled = gs.getProperty('sn_ci_analytics.enable.par.dashboard');
        return !isAppseeEnabled || isParEnabled;
    },

    getMaximumSearchesSupported: function() {
        return parseInt(gs.getProperty('sn_ci_analytics.max.search.threshold', 10000));
    },

    getMaximumEventPropSupported: function() {
        return parseInt(gs.getProperty('sn_ci_analytics.max.event_props.threshold', 100));
    },

    shouldShowHashedUserId: function() {
        return gs.getProperty('sn_ci_analytics.show_hashed_user_id', 'false');
    },

    showNewUserSearchMetricsPage: function() {
        return gs.getProperty('sn_ci_analytics.show_new_user_search_metrics_page', true) == "true";
    },

    type: 'CAConfig'
};
