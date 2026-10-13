var NotifyRecordCallFlowAction = Class.create();
NotifyRecordCallFlowAction.prototype = Object.extendsObject(BaseNotifyFlowAction, {
    initialize: function() {
        BaseNotifyFlowAction.prototype.initialize.apply(this, arguments);
        this.recordAction = this.action.addRecord();
        this.maxDuration = null;
        this.timeout = null;
        this.finishKey = null;
    },

    setMaxDuration: function( /*Number*/ maxDuration) {
        if (gs.nil(maxDuration) || typeof maxDuration !== 'number')
            this.notifyFlowErrorHandler.throwFlowActionSetterError(this.type, "Max Duration");
        this.maxDuration = maxDuration;
    },

    setTimeout: function( /*Number*/ timeout) {
        if (gs.nil(timeout) || typeof timeout !== 'number')
            this.notifyFlowErrorHandler.throwFlowActionSetterError(this.type, "timeout");
        this.timeout = timeout;
    },

    setFinishKey: function( /*string*/ finishKey) {
        if (gs.nil(finishKey) || (finishKey !== '*' && finishKey !== '#'))
            this.notifyFlowErrorHandler.throwFlowActionSetterError(this.type, "Finish Key");
        this.finishKey = finishKey;
    },

    execute: function() {
        if (gs.nil(this.timeout) || gs.nil(this.maxDuration) || gs.nil(this.notifyCallGR) || gs.nil(this.finishKey))
            this.notifyFlowErrorHandler.throwInvalidInputsToAction(this.type);
        this.recordAction.setMaxDuration(this.maxDuration);
        this.recordAction.setTimeout(this.timeout);
        this.recordAction.setFinishKey(this.finishKey);
        var json = this.action.toJson();

        var notifyActivityGR = new GlideRecord(NotifyFlowConstants.TABLES.NOTIFY_WF_ACTIVITY);
        notifyActivityGR.initialize();
        notifyActivityGR.setValue(NotifyFlowConstants.COLUMNS.NOTIFY_CALL, this.notifyCallGR.getUniqueValue());
        notifyActivityGR.setValue(NotifyFlowConstants.COLUMNS.NOTIFY_ACTION, json);
        notifyActivityGR.insert();

        this._setNotifyActivityGR(notifyActivityGR);
    },

    type: 'NotifyRecordCallFlowAction'
});
