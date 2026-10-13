var NotifyForwardToNotifyClientFlowAction = Class.create();
NotifyForwardToNotifyClientFlowAction.prototype = Object.extendsObject(BaseNotifyFlowAction, {
    initialize: function() {
        BaseNotifyFlowAction.prototype.initialize.apply(this, arguments);
        this.dialAction = this.action.addDial();
        this.notifyClient = null;
        this.timeout = null;
        this.record = null;
    },

    _isClientAvailable: function( /*GlideRecord */ notifyClientRecord) {
        var notifyClientSessionGR = new GlideRecord(NotifyFlowConstants.TABLES.NOTIFY_CLIENT_SESSION);
        notifyClientSessionGR.addQuery(NotifyFlowConstants.COLUMNS.USER, notifyClientRecord.getUniqueValue());
        notifyClientSessionGR.query();
        notifyClientSessionGR.next();

        return (
            notifyClientSessionGR.next() &&
            notifyClientSessionGR.getValue(NotifyFlowConstants.COLUMNS.AVAILABLE) === "1"
        );
    },

    _isClientInActiveSession: function( /*GlideRecord */ notifyClientRecord) {
        var clientID = notifyClientRecord.getTableName() + "-" + notifyClientRecord.getUniqueValue();
        var notifyCallStatusGR = new GlideRecord(NotifyFlowConstants.TABLES.NOTIFY_CALL_STATUS);
        notifyCallStatusGR.addEncodedQuery("notify_call.client=" + clientID);
        notifyCallStatusGR.orderByDesc(NotifyFlowConstants.COLUMNS.SYS_CREATED_ON);
        notifyCallStatusGR.setLimit(1);
        notifyCallStatusGR.query();

        if (notifyCallStatusGR.next()) {
            var status = notifyCallStatusGR.getValue(NotifyFlowConstants.COLUMNS.STATUS);
            return (
                status === NotifyFlowConstants.COLUMN_VALUES.RINGING ||
                status === NotifyFlowConstants.COLUMN_VALUES.IN_PROGESS
            );
        }
        return false;
    },

    setNotifyClient: function( /*GlideRecord */ notifyClientRecord) {
        // make sure the notify client record is actually a GlideRecord
        if (gs.nil(notifyClientRecord) || typeof notifyClientRecord !== "object" || typeof notifyClientRecord.isValid !== "function")
            this.throwNotifyFlowActionError(
                this.type,
                gs.getMessage("Notify Client is NOT a GlideRecord")
            );

        // make sure the notify client record is valid
        if (!notifyClientRecord.isValidRecord())
            this.throwNotifyFlowActionError(
                this.type,
                gs.getMessage("Notify Client is NOT a valid GlideRecord")
            );

        this.notifyClient = notifyClientRecord;
    },

    setTimeout: function( /*Number*/ timeout) {
        if (gs.nil(timeout) || typeof timeout !== "number" || timeout <= 0)
            this.notifyFlowErrorHandler.throwFlowActionSetterError(this.type, "timeout");
        this.timeout = timeout;
    },

    setRecord: function( /*Boolean */ record) {
        if ((gs.nil(record) || typeof record !== 'boolean') && (record !== "true" && record !== "false"))
            this.notifyFlowErrorHandler.throwFlowActionSetterError(this.type, "record");
        this.record = record;
    },

    execute: function() {
        if (gs.nil(this.notifyClient) || gs.nil(this.timeout) || gs.nil(this.record))
            this.notifyFlowErrorHandler.throwInvalidInputsToAction(this.type);

        // make sure notify client is available
        if (!this._isClientAvailable(this.notifyClient))
            this.throwNotifyFlowActionError(
                this.type,
                gs.getMessage("Notify Client is NOT available")
            );

        // make sure notify client is not active in another session
        if (this._isClientInActiveSession(this.notifyClient))
            this.throwNotifyFlowActionError(
                this.type,
                gs.getMessage("Notify Client is already active in another session")
            );

        this.dialAction.setClientRecord(this.notifyClient.getTableName(), this.notifyClient.getUniqueValue());
        this.dialAction.setTimeout(this.timeout);
        this.dialAction.setRecord(this.record);

        // Save the forward to notify client action into a new notify_wf_activity
        var json = this.action.toJson();
        var notifyActivityGR = new GlideRecord(NotifyFlowConstants.TABLES.NOTIFY_WF_ACTIVITY);
        notifyActivityGR.initialize();
        notifyActivityGR.setValue(NotifyFlowConstants.COLUMNS.NOTIFY_CALL, this.notifyCallGR.getUniqueValue());
        notifyActivityGR.setValue(NotifyFlowConstants.COLUMNS.NOTIFY_ACTION, json);
        notifyActivityGR.insert();

        this._setNotifyActivityGR(notifyActivityGR);
    },

    type: 'NotifyForwardToNotifyClientFlowAction'
});
