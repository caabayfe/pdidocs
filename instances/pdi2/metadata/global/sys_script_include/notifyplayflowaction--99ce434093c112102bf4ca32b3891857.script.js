var NotifyPlayFlowAction = Class.create();
NotifyPlayFlowAction.prototype = Object.extendsObject(BaseNotifyFlowAction, {
    initialize: function() {
        BaseNotifyFlowAction.prototype.initialize.apply(this, arguments);
        this.playAction = this.action.addPlay();
        this.url = null;
        this.loop = null;
    },

    // Setters
    setURL: function( /*String*/ url) {
        if (gs.nil(url) || typeof url != "string")
            this.notifyFlowErrorHandler.throwFlowActionSetterError(this.type, "url");
        this.url = new NotifyClientHelper().cleanURL(url);
    },

    setLoop: function( /*Integer*/ loop) {
        if (gs.nil(loop) || typeof loop != "number" || loop < 0)
            this.notifyFlowErrorHandler.throwFlowActionSetterError(this.type, "loop");
        this.loop = loop;
    },

    execute: function( /*String*/ url, /*Number*/ loop, /*GlideRecord*/ notifyCallGR) {
        if (gs.nil(this.url) || gs.nil(this.loop) || gs.nil(this.notifyCallGR))
            this.notifyFlowErrorHandler.throwInvalidInputsToAction(this.type);

        this.playAction.setURL(this.url);
        this.playAction.setLoop(this.loop);

        // Save the play action into a new notify_wf_activity
        var json = this.action.toJson();
        var notifyActivityGR = new GlideRecord(NotifyFlowConstants.TABLES.NOTIFY_WF_ACTIVITY);
        notifyActivityGR.initialize();
        notifyActivityGR.setValue(NotifyFlowConstants.COLUMNS.NOTIFY_CALL, this.notifyCallGR.getUniqueValue());
        notifyActivityGR.setValue(NotifyFlowConstants.COLUMNS.NOTIFY_ACTION, json);
        notifyActivityGR.insert();

        this._setNotifyActivityGR(notifyActivityGR);
    },

    type: 'NotifyPlayFlowAction'
});
