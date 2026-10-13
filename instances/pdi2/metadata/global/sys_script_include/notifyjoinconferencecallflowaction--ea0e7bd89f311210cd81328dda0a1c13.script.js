var NotifyJoinConferenceCallFlowAction = Class.create();
NotifyJoinConferenceCallFlowAction.prototype = Object.extendsObject(BaseNotifyFlowAction, {
    initialize: function() {
        BaseNotifyFlowAction.prototype.initialize.apply(this, arguments);
        this.joinConferenceAction = this.action.addConference();
        this.conferenceCallName = null;
        this.startOnEnter = null;
        this.endOnExit = null;
        this.muted = null;
        this.hangupOnStar = null;
        this.record = null;
        this.beepOnEnter = null;
        this.beepOnExit = null;
        this.enableImmediateInput = null;
    },

    setName: function( /*String*/ name) {
        if (gs.nil(name) || typeof name != "string")
            this.notifyFlowErrorHandler.throwFlowActionSetterError(this.type, "name");
        this.conferenceCallName = name;
    },

    setStartOnEnter: function( /*Boolean*/ startOnEnter) {
        if (gs.nil(startOnEnter) || typeof startOnEnter != 'boolean')
            this.notifyFlowErrorHandler.throwFlowActionSetterError(this.type, "startOnEnter");
        this.startOnEnter = startOnEnter;
    },

    setEndOnExit: function( /*Boolean*/ endOnExit) {
        if (gs.nil(endOnExit) || typeof endOnExit != 'boolean')
            this.notifyFlowErrorHandler.throwFlowActionSetterError(this.type, "endOnExit");
        this.endOnExit = endOnExit;
    },

    setMuted: function( /*Boolean*/ muted) {
        if (gs.nil(muted) || typeof muted != 'boolean')
            this.notifyFlowErrorHandler.throwFlowActionSetterError(this.type, "muted");
        this.muted = muted;
    },

    setHangupOnStar: function( /*Boolean*/ hangupOnStar) {
        if (gs.nil(hangupOnStar) || typeof hangupOnStar != 'boolean')
            this.notifyFlowErrorHandler.throwFlowActionSetterError(this.type, "hangupOnStar");
        this.hangupOnStar = hangupOnStar;
    },

    setRecord: function( /*Boolean*/ record) {
        if (gs.nil(record) || typeof record != 'boolean')
            this.notifyFlowErrorHandler.throwFlowActionSetterError(this.type, "record");
        this.record = record;
    },

    setBeepOnEnter: function( /*Boolean*/ beepOnEnter) {
        if (gs.nil(beepOnEnter) || typeof beepOnEnter != 'boolean')
            this.notifyFlowErrorHandler.throwFlowActionSetterError(this.type, "beepOnEnter");
        this.beepOnEnter = beepOnEnter;
    },

    setBeepOnExit: function( /*Boolean*/ beepOnExit) {
        if (gs.nil(beepOnExit) || typeof beepOnExit != 'boolean')
            this.notifyFlowErrorHandler.throwFlowActionSetterError(this.type, "beepOnExit");
        this.beepOnExit = beepOnExit;
    },

    setEnableImmediateInput: function( /*Boolean*/ enableImmediateInput) {
        if (gs.nil(enableImmediateInput) || typeof enableImmediateInput != 'boolean')
            this.notifyFlowErrorHandler.throwFlowActionSetterError(this.type, "enableImmediateInput");
        this.enableImmediateInput = enableImmediateInput;
    },

    execute: function( /*JSON*/ additionalConfig) {
        if (gs.nil(this.conferenceCallName) || gs.nil(this.startOnEnter) || gs.nil(this.endOnExit) || gs.nil(this.muted) || gs.nil(this.hangupOnStar) || gs.nil(this.record) || gs.nil(this.notifyCallGR))
            this.notifyFlowErrorHandler.throwInvalidInputsToAction(this.type);

        this.joinConferenceAction.setName(this.conferenceCallName);
        this.joinConferenceAction.setStartOnEnter(this.startOnEnter);
        this.joinConferenceAction.setEndOnExit(this.endOnExit);
        this.joinConferenceAction.setMuted(this.muted);
        this.joinConferenceAction.setHangupOnStar(this.hangupOnStar);
        this.joinConferenceAction.setRecord(this.record);
        this.joinConferenceAction.putExtraOption('beepOnEnter', this.beepOnEnter);
        this.joinConferenceAction.putExtraOption('beepOnExit', this.beepOnExit);
        this.joinConferenceAction.putExtraOption('enableImmediateInput', this.enableImmediateInput);

        //Set additional configs
        var keys = Object.getOwnPropertyNames(additionalConfig);
        for (var i = 0; i < keys.length; i++) {
            var k = keys[i];
            var value = additionalConfig[k];
            if (value === false || value || value === 0)
                this.joinConferenceAction.putExtraOption(k, value);
        }

        var json = this.action.toJson();
        var notifyActivityGR = new GlideRecord(NotifyFlowConstants.TABLES.NOTIFY_WF_ACTIVITY);
        notifyActivityGR.initialize();
        notifyActivityGR.setValue(NotifyFlowConstants.COLUMNS.NOTIFY_CALL, this.notifyCallGR.getUniqueValue());
        notifyActivityGR.setValue(NotifyFlowConstants.COLUMNS.NOTIFY_ACTION, json);
        notifyActivityGR.insert();

        this._setNotifyActivityGR(notifyActivityGR);

    },

    type: 'NotifyJoinConferenceCallFlowAction'
});
