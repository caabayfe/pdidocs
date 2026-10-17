var NotifySayFlowAction = Class.create();
NotifySayFlowAction.prototype = Object.extendsObject(BaseNotifyFlowAction, {
    initialize: function() {
        BaseNotifyFlowAction.prototype.initialize.apply(this, arguments);
        this.sayAction = this.action.addSay();
        this.text = null;
        this.languageCode = null;
    },

    // Setters
    setText: function( /*String*/ text) {
        if (gs.nil(text) || typeof text != "string")
            this.notifyFlowErrorHandler.throwFlowActionSetterError(this.type, "text");
        this.text = text;
    },

    setLanguage: function( /*String*/ languageCode) {
        if (gs.nil(languageCode) || typeof languageCode != "string")
            this.notifyFlowErrorHandler.throwFlowActionSetterError(this.type, "languageCode");
        this.languageCode = languageCode;
    },

    execute: function() {
        if (gs.nil(this.text) || gs.nil(this.languageCode) || gs.nil(this.notifyCallGR))
            this.notifyFlowErrorHandler.throwInvalidInputsToAction(this.type);

        this.sayAction.setText(this.text);
        this.sayAction.setLanguage(this.languageCode);

        // Save the say action into a new notify_wf_activity
        var json = this.action.toJson();
        var notifyActivityGR = new GlideRecord(NotifyFlowConstants.TABLES.NOTIFY_WF_ACTIVITY);
        notifyActivityGR.initialize();
        notifyActivityGR.setValue(NotifyFlowConstants.COLUMNS.NOTIFY_CALL, this.notifyCallGR.getUniqueValue());
        notifyActivityGR.setValue(NotifyFlowConstants.COLUMNS.NOTIFY_ACTION, json);
        notifyActivityGR.insert();

        this._setNotifyActivityGR(notifyActivityGR);
    },

    type: 'NotifySayFlowAction'
});
