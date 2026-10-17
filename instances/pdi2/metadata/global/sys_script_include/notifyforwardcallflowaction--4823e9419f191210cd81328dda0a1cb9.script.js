var NotifyForwardCallFlowAction = Class.create();
NotifyForwardCallFlowAction.prototype = Object.extendsObject(BaseNotifyFlowAction, {
    initialize: function() {
        BaseNotifyFlowAction.prototype.initialize.apply(this, arguments);
        this.forwardAction = this.action.addDial();
        this.timeout = null;
        this.record = null;
        this.phoneNumber = null;
    },

    performValidations: function(notifyCallGR, phoneNumber, group) {
        var notifyNumber = new GlideRecord(NotifyFlowConstants.TABLES.NOTIFY_NUMBER);
        var phoneNumberElement = new GlideElementPhoneNumber();
        var isValid = phoneNumberElement.setPhoneNumber(phoneNumber, true);

        if (!isValid) {
            // not a valid phone number, set the activity to error
            this.notifyFlowErrorHandler.throwNotifyFlowActionError(
                this.type,
                gs.getMessage('Cannot forward call as {0} is not an E.164 compliant phone number',phoneNumber)
            );
        } else if (phoneNumber === notifyCallGR.getValue(NotifyFlowConstants.COLUMNS.PHONE_NUMBER)) {
            // number to forward to can't be the same as the number that originally made the call
            // set the activity to error
            this.notifyFlowErrorHandler.throwNotifyFlowActionError(
                this.type,
                gs.getMessage("Cannot forward call to same number that made the call")
            );
        } else if (notifyNumber.get(NotifyFlowConstants.COLUMNS.PHONE_NUMBER, phoneNumber) && notifyNumber.notify_group.toString() === group) {
            // we are trying to call a number from the same number_group, which will cause an
            // infinite loop. Set the activity to error
            this.notifyFlowErrorHandler.throwNotifyFlowActionError(
                this.type,
                gs.getMessage("Cannot forward call to a phone number in the same Notify Group as the current call")
            );
        }
    },

    setTimeout: function(/*Number*/timeout) {
        if (gs.nil(timeout) || typeof timeout !== 'number')
            this.notifyFlowErrorHandler.throwFlowActionSetterError(this.type, "timeout");
        this.timeout = timeout;
    },

    setRecord: function(/*Boolean*/record) {
        if ((gs.nil(record) || typeof record !== 'boolean') && (record !== "true" && record !== "false"))
            this.notifyFlowErrorHandler.throwFlowActionSetterError(this.type, "record");
        this.record = record;
    },

    setPhoneNumber: function(/*String*/phoneNumber) {
		var phoneNumberElement = new GlideElementPhoneNumber();
        if (gs.nil(phoneNumber) || !phoneNumberElement.setPhoneNumber(phoneNumber, true))
            this.notifyFlowErrorHandler.throwFlowActionSetterError(this.type, "phoneNumber");
        this.phoneNumber = phoneNumber;
    },
    execute: function() {
        if (gs.nil(this.timeout) || gs.nil(this.record) || gs.nil(this.notifyCallGR))
            this.notifyFlowErrorHandler.throwInvalidInputsToAction(this.type);
        this.forwardAction.setTimeout(this.timeout);
        this.forwardAction.setRecord(this.record);
        this.forwardAction.setPhoneNumber(this.phoneNumber);
        var json = this.action.toJson();

        var notifyActivityGR = new GlideRecord(NotifyFlowConstants.TABLES.NOTIFY_WF_ACTIVITY);
        notifyActivityGR.initialize();
        notifyActivityGR.setValue(NotifyFlowConstants.COLUMNS.NOTIFY_CALL, this.notifyCallGR.getUniqueValue());
        notifyActivityGR.setValue(NotifyFlowConstants.COLUMNS.NOTIFY_ACTION, json);
        notifyActivityGR.insert();

        this._setNotifyActivityGR(notifyActivityGR);
    },
    type: 'NotifyForwardCallFlowAction'
});
