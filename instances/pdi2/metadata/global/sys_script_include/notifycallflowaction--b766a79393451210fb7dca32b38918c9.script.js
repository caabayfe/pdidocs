var NotifyCallFlowAction = Class.create();
NotifyCallFlowAction.prototype = Object.extendsObject(BaseNotifyFlowAction, {
    initialize: function() {
        BaseNotifyFlowAction.prototype.initialize.apply(this, arguments);
        this.notifyNumberGR = null;
        this.phoneNumber = null;
        this.sourceTable = null;
        this.sourceSysID = null;
        this.conferenceCallGr = null;
        this.userSysId = null;
        this.groupSysId = null;
        this.extraParams = null;
        this.notifyUtils = new NotifyUtil();
    },

    setNotifyNumber: function( /*GlideRecord */ notifyNumberGR) {
        if (gs.nil(notifyNumberGR) || !notifyNumberGR.isValidRecord())
            this.notifyFlowErrorHandler.throwFlowActionSetterError(this.type, "notifyNumberGR");
        this.notifyNumberGR = notifyNumberGR;
    },

    setPhoneNumber: function( /*String*/ phoneNumber) {
        var phoneNumberElement = new GlideElementPhoneNumber();
        if (gs.nil(phoneNumber) || !phoneNumberElement.setPhoneNumber(phoneNumber, true))
            this.notifyFlowErrorHandler.throwFlowActionSetterError(this.type, "phoneNumber");
        this.phoneNumber = phoneNumber;
    },

    setSourceTable: function( /*String*/ sourceTable) {
        var sourceTableGR = new GlideRecord(sourceTable);
        if (gs.nil(sourceTable) || !sourceTableGR.isValid())
            this.notifyFlowErrorHandler.throwFlowActionSetterError(this.type, "sourceTable");
        this.sourceTable = sourceTable;
    },

    setSourceSysID: function( /*String*/ sourceSysID) {
        if (gs.nil(sourceSysID))
            this.notifyFlowErrorHandler.throwFlowActionSetterError(this.type, "sourceSysID");
        this.sourceSysID = sourceSysID;
    },

    setConferenceCallRecord: function( /*GlideRecord */ conferenceCallGr) {
        if (gs.nil(conferenceCallGr) || !conferenceCallGr.isValid())
            this.notifyFlowErrorHandler.throwFlowActionSetterError(this.type, "conferenceCallGr");
        this.conferenceCallGr = conferenceCallGr;
    },
    setUserSysId: function( /*String*/ userSysId) {
        if (gs.nil(userSysId))
            this.notifyFlowErrorHandler.throwFlowActionSetterError(this.type, "userSysId");
        this.userSysId = userSysId;
    },
    setGroupSysId: function( /*String*/ groupSysId) {
        if (gs.nil(groupSysId))
            this.notifyFlowErrorHandler.throwFlowActionSetterError(this.type, "groupSysId");
        this.groupSysId = groupSysId;
    },
    setExtraParams: function( /*JSON*/ extraParams) {
        try {
            if (extraParams) {
                if (typeof extraParams !== 'object') // Handle String 
                    this.extraParams = JSON.parse(extraParams);
                else
                    this.extraParams = extraParams;
            }
        } catch (e) {
            this.notifyFlowErrorHandler.throwFlowActionSetterError(this.type, "extraParams - " + e);
        }
    },

    execute: function() {
        if (gs.nil(this.notifyNumberGR) ||
            gs.nil(this.phoneNumber)
        ) this.notifyFlowErrorHandler.throwInvalidInputsToAction(this.type);

        // check if the notify number has a group
        var notifyGroup = this.notifyNumberGR.getElement(NotifyFlowConstants.COLUMNS.NOTIFY_GROUP);
        var notifyGroupGR = notifyGroup.getRefRecord();
        if (gs.nil(notifyGroup.toString()) || !notifyGroupGR.isValidRecord())
            this.notifyFlowErrorHandler.throwNotifyFlowActionError(
                this.type,
                gs.getMessage("Notify Number is not part of any Notify Group")
            );

        // check if the notify group has an outgoing call subflow configured
        var outgoingCallSubflow = notifyGroupGR.getElement(NotifyFlowConstants.COLUMNS.OUTGOING_CALL_SUBFLOW);
        if (gs.nil(outgoingCallSubflow.toString()) || !outgoingCallSubflow.getRefRecord().isValidRecord())
            this.notifyFlowErrorHandler.throwNotifyFlowActionError(
                this.type,
                gs.getMessage("Phone Group for this Notify Number does not have an outgoing call subflow configured")
            );

        var sourceGR;
        // check if source record is valid - Optional
        if (!gs.nil(this.sourceTable) && !gs.nil(this.sourceSysID)) {
            sourceGR = new GlideRecord(this.sourceTable);
            sourceGR.get(this.sourceSysID);
            if (!sourceGR.isValidRecord())
                this.notifyFlowErrorHandler.throwNotifyFlowActionError(
                    this.type,
                    gs.getMessage("Source record is not valid")
                );
        }

        // No validations needed for conferenceCallGr, userSysId & groupSysId as they are passed as null or their values. 
        var notify = new SNC.Notify();

		// Reset old errors. 
        this.notifyUtils.resetErrors();

        if (this.extraParams) {
            notify.callWithParams(
                this.notifyNumberGR.getValue(NotifyFlowConstants.COLUMNS.PHONE_NUMBER),
                this.phoneNumber,
                this.conferenceCallGr,
                this.userSysId,
                this.groupSysId,
                sourceGR,
                this.extraParams);
        } else {
            notify.call(
                this.notifyNumberGR.getValue(NotifyFlowConstants.COLUMNS.PHONE_NUMBER),
                this.phoneNumber,
                this.conferenceCallGr,
                this.userSysId,
                this.groupSysId,
                sourceGR);
        }

        var errors = this.notifyUtils.getErrors();
        // get API errors (if any)
        if (notify.hasErrors()) {
            var iter = notify.getErrors().iterator();
            while (iter.hasNext()) {
                errors.push(j2js(iter.next()));
            }
        }

        if (errors.length > 0)
            this.notifyFlowErrorHandler.throwNotifyFlowActionError(
                this.type,
                errors.join(", ")
            );
    },

    type: 'NotifyCallFlowAction'
});
