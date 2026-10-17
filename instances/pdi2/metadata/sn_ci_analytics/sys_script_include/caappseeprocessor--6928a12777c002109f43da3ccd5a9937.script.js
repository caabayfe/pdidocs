var CAAppseeProcessor = Class.create();
CAAppseeProcessor.prototype = {
    initialize: function() {
        this.logger = CIAnalyticsLogger.getLogger({
            source: "CAAppseeProcessor",
        });
        this.config = new CAConfig();
        this.sender = new CASender();
        this.jobMaxConversationCount = this.config.getJobMaxConversationCount();
    },

    process: function() {
        try {
            var caConversationGr;
            if (!this.sender.shouldSend()) {
                caConversationGr = this._queryCAConversation('appsee_status=new^status=processed');
                caConversationGr.setValue('appsee_status', 'ignored');
                caConversationGr.setValue('reason', '[Appsee Job]: Conversation ignored because Appsee is disabled');
                caConversationGr.updateMultiple();
                return;
            }
            var batchProcessor = new CABatchProcessor();
            var isError = false;
            caConversationGr = this._queryCAConversation('appsee_status=new^status=new^ORstatus=onHold^ORstatus=processed');
            var lastOpenUser = "";
            while (caConversationGr.next()) {
                if (caConversationGr.status == 'processed' && gs.nil(caConversationGr.conversation_payload)) {
                    // Handle old conversations status, after v2 is installed for the first time 
                    var _isProcessed = this._handleOldConvs(caConversationGr);
                    if (_isProcessed) continue;
                    //Conversation payload was not populated by ETL
                    var reason = "[Appsee Job]: Conversation ignored due to empty conversation payload";
                    caConversationGr.setValue('reason', this._getReason(caConversationGr, reason));
                    caConversationGr.setValue('appsee_status', 'ignored');
                    caConversationGr.update();
                    continue;
                }
                if (this._canSkipConversation(caConversationGr, lastOpenUser)) {
                    var params = [caConversationGr.conversation, caConversationGr.status, caConversationGr.consumer];
                    this.logger.info("Skipped - Conversation: {0}, ETL Status: {1}, Conversation Consumer: {2}", params);
                    lastOpenUser = caConversationGr.consumer + '';
                    continue;
                }
                var payload = JSON.parse(caConversationGr.getValue('conversation_payload'));
                this._removeParData(payload);
                isError = !batchProcessor.queueOrSend(payload);
                if (isError)
                    return;
            }
            if (!isError)
                batchProcessor.sendAll();
        } catch (err) {
            var message = "CI analytics appsee job failed:" + err.message;
            if (err.stack)
                message = message + "\n" + err.stack;
            this.logger.error(message);
        }
    },

    _handleOldConvs: function(caConversationGr) {
        var appInstalledOn = gs.getProperty('sn_ci_analytics.v2.available');
        if (appInstalledOn) {
            var caConversationCreatedOn = new GlideDateTime(caConversationGr.sys_created_on);
            var appInstalledOnGDT = new GlideDateTime(appInstalledOn);
            if (appInstalledOnGDT.isValid() && caConversationCreatedOn.compareTo(appInstalledOnGDT) < 0) {
                caConversationGr.setValue('appsee_status', 'processed');
                caConversationGr.update();
                return true;
            }
        }
        return false;
    },

    _queryCAConversation: function(query) {
        var caConversationGr = new GlideRecord('sn_ci_analytics_conversation');
        caConversationGr.addNotNullQuery('conversation_payload');
        if (query)
            caConversationGr.addEncodedQuery(query);
        caConversationGr.orderBy('consumer');
        caConversationGr.orderBy('sys_created_on');
        if (this.jobMaxConversationCount > 0)
            caConversationGr.setLimit(this.jobMaxConversationCount);
        caConversationGr.query();
        return caConversationGr;
    },

    _canSkipConversation: function(caConversationGr, lastOpenUser) {
        var status = caConversationGr.status;
        if (status != 'processed')
            return true;
        var currentRecordUser = caConversationGr.consumer + '';
        return !gs.nil(currentRecordUser) && (currentRecordUser === lastOpenUser);
    },

    _getReason: function(caConversationGr, reason) {
        if (gs.nil(caConversationGr))
            return reason;
        var reasonValue = caConversationGr.getValue('reason');
        reasonValue = gs.nil(reasonValue) ? reason : reasonValue + '\n' + reason;
        return reasonValue;
    },

    _removeParData: function(payload) {
        if (gs.nil(payload))
            return;
        if (payload[CAPARConstants.DYNAMICPROPERTIES] && payload[CAPARConstants.DYNAMICPROPERTIES][CAPARConstants.DP_FEEDBACK_RESULT_ID])
            delete payload[CAPARConstants.DYNAMICPROPERTIES][CAPARConstants.DP_FEEDBACK_RESULT_ID];
        if (Array.isArray(payload[CAPARConstants.EVENTS])) {
            payload[CAPARConstants.EVENTS].forEach(function(event) {
                if (event[CAPARConstants.PAR_PAYLOAD])
                    delete event[CAPARConstants.PAR_PAYLOAD];
            });
        }
    },

    type: 'CAAppseeProcessor'

};
