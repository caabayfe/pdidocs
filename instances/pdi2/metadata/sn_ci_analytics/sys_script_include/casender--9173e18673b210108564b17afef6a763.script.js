var CASender = Class.create();
CASender.MSG_TEMPLATES = {
    MAX_RETRY_ERR_MSG: "Aborting the process after retry count : {0}",
    MAX_RETRY_WARN_MSG: "Error while sending request to Appsee, retrying the request Retry Count: {0}, error: {1}",
    APP_REG_WARN_MSG: "No Application registered, creating a new application for Application Table Name: {0}, application record sys_id: {1}",
    APP_REG_ERR_MSG: "Error while registering application Application Table Name: {0}, application record sys_id: {1}, error: {2}",
    APP_REG_ERR_MIGR: "Error while migrating old conversation records. Error details: {0}",
    APPSEE_NOT_ENABLED: "Appsee is not enabled, please check the configuration",
    APP_VERSION_NOT_VALID: "Application doesn't have a valid version, please check the configuration.",
    ANALYTICS_PROCESSING_DISABLED: "Analytics processing is disabled, please check the configuration."
};

CASender.prototype = {
    initialize: function() {
        this.APP_TYPE = "virtual_agent";
        this.SCOPE_ID = "c53ca02a73c310108564b17afef6a7c0";
        this.PLATFORM_TYPE = "chat";
        this.MIGRATION_PAGE_SIZE = 40000;
        this.config = new CAConfig();
        this.maxRequestRetry = this.config.getMaxRequestRetry();
        this.appTableName = this.config.getAppTableName();
        this.appRecordSysId = this.config.getAppRecordSysId();
        this.logger = CIAnalyticsLogger.getLogger("CASender");
    },

    send: function(payload) {
        if (!this.shouldSend())
            return;

        var retryCount = 0;
        return this._post(payload, retryCount);
    },

    _post: function(payload, retryCount) {
        try {
            //posting the payload to Appsee
            var params = sn_analytics_api.ParamsBuilder.addParams().withPlatform(this.PLATFORM_TYPE).withAppVersion(this._getAppVersion()).build();
            return new sn_analytics_api.AnalyticsSessionsApi(this.appTableName, this.appRecordSysId).addSessions(params, payload);
        } catch (error) {
            return this._handleError(payload, retryCount, error);
        }
    },

    _handleError: function(payload, retryCount, error) {
        if (this.maxRequestRetry < retryCount) {
            this.logger.error(CASender.MSG_TEMPLATES.MAX_RETRY_ERR_MSG, [this.maxRequestRetry]);
            return false;
        }

        this.logger.warn(CASender.MSG_TEMPLATES.MAX_RETRY_WARN_MSG, [retryCount, error]);
        retryCount = retryCount + 1;
        return this._post(payload, retryCount);
    },

    shouldSend: function() {
        var analyticsSettings = sn_app_analytics.SNAnalytics.retrieveSettings(this.appTableName, this.appRecordSysId);
        if (!this._isApplicationExist()) {
            try {
                this.logger.error(CASender.MSG_TEMPLATES.APP_REG_WARN_MSG, [this.appTableName, this.appRecordSysId]);
                this.registerApplication();
                return true;
            } catch (error) {
                this.logger.error(CASender.MSG_TEMPLATES.APP_REG_ERR_MSG, [this.appTableName, this.appRecordSysId, error]);
                return false;
            }
        }

        if (!this._isAnalyticsEnabled(analyticsSettings)) {
            this.logger.warn(CASender.MSG_TEMPLATES.APPSEE_NOT_ENABLED);
            return false;
        }

        if (this.config.isAnalyticsProcessingEnabled() != 'true') {
            this.logger.warn(CASender.MSG_TEMPLATES.ANALYTICS_PROCESSING_DISABLED);
            return false;
        }

        return true;
    },

    _isAnalyticsEnabled: function(analyticsSettings) {
        return sn_app_analytics.SNAnalytics.isEnabled() && analyticsSettings.isEnabled();
    },

    _isApplicationExist: function() {
        return sn_app_analytics.SNAnalytics.isApplicationRegistered(this.appTableName, this.appRecordSysId);
    },

    _getAppVersion: function() {
        var storeAppGr = new GlideRecord("sys_store_app");
        storeAppGr.addQuery("sys_id", this.SCOPE_ID);
        storeAppGr.query();
        if (storeAppGr.next())
            return storeAppGr.getValue("version");

        throw Error(CASender.MSG_TEMPLATES.APP_VERSION_NOT_VALID);
    },

    _insert: function(csConversationGr) {
        var sysId = csConversationGr.getValue('sys_id');
        if (!sysId) return null;
        var appTableGr = new GlideRecord("sn_ci_analytics_conversation");
        appTableGr.addQuery("conversation", sysId);
        appTableGr.query();
        if (appTableGr.next()) return null;
        var completedStates = gs.getProperty('sn_ci_analytics.analytic_conversation_completed_states', '');
        appTableGr.initialize();
        appTableGr.conversation = csConversationGr.sys_id;
        appTableGr.status = 'new';
        appTableGr.par_status = 'new';
        appTableGr.appsee_status = 'new';
        appTableGr.conversation_type = csConversationGr.conversation_type;
        appTableGr.conversation_closed_at = csConversationGr.conversation_completed;
        appTableGr.conversation_created_at = csConversationGr.sys_created_on;
        appTableGr.conversation_state = completedStates.includes(csConversationGr.state) ? 'completed' : 'open';
        appTableGr.consumer = csConversationGr.consumer.sys_id;
        return appTableGr.insert();
    },

    _fetchAndMigrateConversations: function(endTime, start) {
        var pageSize = this.MIGRATION_PAGE_SIZE;
        var csCount = 0;
        var csConversationGr = new GlideRecord("sys_cs_conversation");
        csConversationGr.addQuery("sys_created_on", ">=", gs.beginningOfLast30Days());
        csConversationGr.addQuery("sys_created_on", "<", endTime);
        csConversationGr.addQuery("conversation_type", "!=", 'notification');
        csConversationGr.chooseWindow(start, (start + pageSize));
        csConversationGr.orderBy("sys_created_on");
        csConversationGr.query();
        while (csConversationGr.next()) {
            this._insert(csConversationGr);
            csCount += 1;
        }
        return csCount;
    },

    _migrateConversations: function() {
        //after registering the application, migrate sys_conversation to sn_ci_analytics_conversation (last 30 days)
        try {
            //pre migration, halt processing
            this.config.disableAnalyticsProcessing();

            var pageSize = this.MIGRATION_PAGE_SIZE,
                _self = this,
                page = 0;

            var endTime = new GlideDateTime().getValue().toString(),
                fetchCount = 0;
            do {
                fetchCount = _self._fetchAndMigrateConversations(endTime, (page * pageSize));
                page += 1;
            } while (fetchCount == pageSize);


            //post migration, resume processing
            this.config.enableAnalyticsProcessing();
            return;
        } catch (e) {
            this.config.enableAnalyticsProcessing();
            this.logger.error(CASender.MSG_TEMPLATES.APP_REG_ERR_MIGR, [e.message]);
        }
    },

    registerApplication: function() {
        sn_app_analytics.SNAnalytics.registerChatApplication(this.appTableName, this.appRecordSysId, this.APP_TYPE);
        sn_app_analytics.SNAnalytics.processAllUnRegisteredSettings();
        //Migration is no longer needed as the CI analytics app gets automatically installed with the Virtual Agent Pro.
        //this._migrateConversations();
    },

    type: 'CASender'
};
