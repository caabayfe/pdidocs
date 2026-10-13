var NotifyDatabase = Class.create();
NotifyDatabase.prototype = {
    TABLE_NUMBER: 'notify_number',
    TABLE_CALL: 'notify_call',
    TABLE_MESSAGE: 'notify_message',
    TABLE_CONFERENCE: 'notify_conference_call',
    TABLE_CALL_STATUS: 'notify_call_status',
    TABLE_GROUP: 'notify_group',
    TABLE_PARTICIPANT: 'notify_participant',
    TABLE_PARTICIPANT_SESSION: 'notify_participant_session',
    TABLE_QUEUE: 'notify_queue',
    TABLE_RECORDING: 'notify_recording',
    TABLE_ACTION: 'notify_action',
    TABLE_TRANSCRIPT_SUMMARY: 'notify_transcript_summary',
    VALID_CALL_STATUS: ['unknown', 'initiated', 'ringing', 'in_progress', 'completed', 'no_answer', 'busy', 'failed', 'invalid', 'input'],
    VALID_MESSAGE_STATUS: ['unknown', 'blocked', 'accepted', 'queued', 'sending', 'sent', 'receiving', 'received', 'delivered', 'undelivered', 'failed'],
    MESSAGE_STATUS_ORDERS: {
        'unknown': 0,
        'blocked': 0,
        'accepted': 1,
        'queued': 2,
        'sending': 3,
        'sent': 4,
        'receiving': 3,
        'received': 4,
        'delivered': 5,
        'undelivered': 5,
        'failed': 5
    },
    NOTIFY_NUMBER_SMS_VOICE_CONFIG: {
        YES: "yes",
        NO: "no",
        UNKNOWN: "unknown"
    },
    initialize: function() {},
    getNotifyNumberByNumber: function( /*String*/ number) {
        var gr = new GlideRecord(this.TABLE_NUMBER);
        gr.addActiveQuery();
        if (gr.get('number', number))
            return gr;
    },
    getNotifyPhoneNumberGroupRecord: function( /*String*/ notifyPhoneNumber) {
        // get notify number record
        var notifyNumberRecord = this.getNotifyNumberRecordOrInsertIfNonExistent(notifyPhoneNumber);
        var notifyGroupSysID = notifyNumberRecord.getValue("notify_group");
        // get the notify group record for this id
        var notifyGroup = new GlideRecord(this.TABLE_GROUP);
        if (notifyGroup.get(notifyGroupSysID))
            return notifyGroup;
        else
            // there is no group associated to this phone number
            gs.error("There is no phone number group associated to the " + notifyPhoneNumber + " number");
    },
    unsyncNotifyNumbersForDriver: function( /*String*/ driverName) {
        if (!driverName)
            throw 'No driver name provided for unsyncNotifyNumbersForDriver';
        var numbersGr = new GlideRecord(this.TABLE_NUMBER);
        numbersGr.addActiveQuery();
        numbersGr.addQuery("owner", driverName);
        numbersGr.setValue('active', false);
        numbersGr.updateMultiple();
    },
    getClientRecord: function( /*String*/ clientID) {
        var elements = clientID.split('__');
        if (elements.length === 2) {
            var table = elements[0];
            var sysId = elements[1];
            var clientGr = new GlideRecord(table);
            if (clientGr.isValid())
                if (clientGr.get(sysId))
                    return clientGr;
        }
    },
    addClientCallRecord: function( /*String*/ callSid, /*String*/ clientID, /*String*/ notifyNumber) {
        var gr = new GlideRecord('notify_call');
        gr.initialize();
        gr.call_id = callSid;
        gr.type = "browser";
        var grNum = this.getNotifyNumberByNumber(notifyNumber);
        if (grNum)
            gr.notify_number = grNum.getUniqueValue();
        var clientGr = this.getClientRecord(clientID);
        if (clientGr) {
            gr.client_table = clientGr.getTableName();
            gr.client = clientGr.getUniqueValue();
        }
        gr.direction = "inbound";
        return gr.insert();
    },
    getNotifyCallRecordByCallID: function( /*String*/ callSid) {
        var gr = new GlideRecord(this.TABLE_CALL);
        if (gr.get('call_id', callSid))
            return gr;
        else
            gs.error("NotifyDatabase.getNotifyCallRecordByCallID: No call record found with call id " + callSid);
    },
    getNotifyConfRecordByFriendlyName: function( /*String*/ confFriendlyName) {
        var gr = new GlideRecord(this.TABLE_CONFERENCE);
        if (gr.get('number', confFriendlyName))
            return gr;
        else
            gs.error("NotifyDatabase.getNotifyConfRecordByFriendlyName: No conference record found with friendly name " + confFriendlyName);
    },
    getNotifyConfRecordBySid: function( /*String*/ confSid) {
        var confGr = new GlideRecord(this.TABLE_CONFERENCE);
        if (confGr.get('conference_call_id', confSid))
            return confGr;
        else
            gs.error("NotifyDatabase.getNotifyConfRecordBySid: No conference record found with given SID " + confSid);
    },
    getNotifyMessageRecordByMessageSid: function(messageSid) {
        var gr = new GlideRecord(this.TABLE_MESSAGE);
        if (gr.get('message_id', messageSid))
            return gr;
        else
            gs.error("NotifyDatabase.getNotifyMessageRecordByMessageSid: No message record found with message id " + messageSid);
    },
    getMessageRecord: function(messageID) {
        var gr = new GlideRecord(this.TABLE_MESSAGE);
        if (gr.get(messageID))
            return gr;
        else
            gs.error("NotifyDatabase.getMessageRecord: No message record found with message record id " + messageID);
    },
    isValidCallStatus: function( /*String*/ callStatus) {
        return this.VALID_CALL_STATUS.indexOf(callStatus + '') !== -1;
    },
    isValidMessageStatus: function(messageStatus) {
        return this.VALID_MESSAGE_STATUS.indexOf(messageStatus + '') !== -1;
    },
    _messageStatusOrder: function(messageStatus) {
        if (!messageStatus)
            return -1;
        var order = this.MESSAGE_STATUS_ORDERS[messageStatus];
        if (typeof order === 'undefined')
            return -2;
        return order;
    },
    getConfiguredPhoneNumbersForDriver: function(driverName) {
        var configuredPhoneNumbers = [];
        var numbers = new GlideRecord(this.TABLE_NUMBER);
        numbers.addActiveQuery();
        numbers.query("owner", driverName);
        while (numbers.next()) {
            configuredPhoneNumbers.push(numbers.getValue("number"));
        }
        return configuredPhoneNumbers;
    },
    _validateDirection: function(direction) {
        if (direction !== 'inbound' && direction !== 'outbound')
            throw 'Provided direction is not valid ' + direction;
    },
    addCallStatus: function( /*String*/ callSid, /*String*/ callStatus, /*Integer*/ order) {
        if (!this.isValidCallStatus(callStatus)) {
            gs.error("NotifyDatabase: Received unknown status: " + callStatus);
            callStatus = 'unknown';
        }
        return this._addCallStatus(callSid, callStatus, order);
    },
    _addCallStatus: function( /*String*/ callSid, /*String*/ callStatus, /*Integer*/ order) {
        var callRecord = this.getNotifyCallRecordByCallID(callSid);
        if (callRecord) {
            var notifyCallStatusGr = new GlideRecord(this.TABLE_CALL_STATUS);
            notifyCallStatusGr.addQuery("notify_call", callRecord.getUniqueValue());
            notifyCallStatusGr.orderByDesc("order");
            notifyCallStatusGr.orderByDesc("sys_created_on");
            notifyCallStatusGr.query();
            if (!notifyCallStatusGr.next() || notifyCallStatusGr.getValue("status") + '' !== callStatus) {
                notifyCallStatusGr.initialize();
                notifyCallStatusGr.notify_call = callRecord.getUniqueValue();
                notifyCallStatusGr.status = callStatus;
                if (order || order === 0)
                    notifyCallStatusGr.order = order;
                else
                    notifyCallStatusGr.order = this._getMaxOrder(callRecord.getUniqueValue()) + 1;
                notifyCallStatusGr.insert();
            }
            return notifyCallStatusGr;
        }
    },
    getNotifyNumberRecordOrInsertIfNonExistent: function( /*String*/ notifyPhoneNumber) {
        var notifyNumber = new GlideRecord(this.TABLE_NUMBER);
        if (notifyNumber.get("number", notifyPhoneNumber))
            return notifyNumber;
        else {
            // If the customer bought a new number after setting up the driver config and
            // did not visit the config to reconfigure the number then we are now forced
            // to make an expensive call to re-get all phone numbers and figure out its
            // properties and owner.
            var numList = new SNC.Notify().getPhoneNumbers(notifyPhoneNumber);
            if (numList.size() != 1) {
                gs.error("found " + numList.size() + " numbers for Notify phone number " + notifyPhoneNumber + " while we expected 1");
                return;
            }
            var nNum = numList.get(0);
            if (nNum) {
                notifyNumber.initialize();
                notifyNumber.setValue("owner", nNum.getOwner());
                if (nNum.isShortCode()) {
                    notifyNumber.setValue("short_code", nNum.getNumber());
                } else {
                    notifyNumber.setValue("phone_number", nNum.getNumber());
                }
                // Setting SMS and VOICE config
                notifyNumber.setValue("has_sms_in", (nNum.supportsIncomingSMS() ? this.NOTIFY_NUMBER_SMS_VOICE_CONFIG.YES : this.NOTIFY_NUMBER_SMS_VOICE_CONFIG.NO));
                notifyNumber.setValue("has_sms_out", (nNum.supportsOutgoingSMS() ? this.NOTIFY_NUMBER_SMS_VOICE_CONFIG.YES : this.NOTIFY_NUMBER_SMS_VOICE_CONFIG.NO));
                notifyNumber.setValue("has_voice_in", (nNum.supportsIncomingPhoneCall() ? this.NOTIFY_NUMBER_SMS_VOICE_CONFIG.YES : this.NOTIFY_NUMBER_SMS_VOICE_CONFIG.NO));
                notifyNumber.setValue("has_voice_out", (nNum.supportsOutgoingPhoneCall() ? this.NOTIFY_NUMBER_SMS_VOICE_CONFIG.YES : this.NOTIFY_NUMBER_SMS_VOICE_CONFIG.NO));
                notifyNumber.insert();
            } else
                gs.error("NotifyDatabase: No one claimed ownership of number " + notifyPhoneNumber + ", unable to auto register this number");
            return notifyNumber;
        }
    },
    addCallRecord: function( /*String*/ notifyPhoneNumber, /*String*/ callSid, /*String*/ externalPhoneNumber, /*String*/ direction, /*String - Optional*/ type) {
        this._validateDirection(direction);
        var numberRecord = this.getNotifyNumberRecordOrInsertIfNonExistent(notifyPhoneNumber);
        var callRecord = new GlideRecord(this.TABLE_CALL);
        // make sure no duplicate records are added (should not happen!)
        if (callSid) {
            if (callRecord.get("call_id", callSid))
                return callRecord;
        }
        // add a call record
        callRecord.initialize();
        callRecord.setValue("notify_number", numberRecord.getUniqueValue());
        callRecord.setValue("call_id", callSid);
        callRecord.setValue("direction", direction);
        callRecord.setValue("phone_number", externalPhoneNumber);
        if (type)
            callRecord.setValue("type", type);
        if (callRecord.insert())
            return callRecord;
    },

    /**
     * @param {NotifyConferenceCallGR} confGR
     */
    tryEndingConferenceCall: function(confGR) {
        if (this.canMakeConferenceCallInActive(confGR))
            this.setConferenceCallActiveState(confGR, false);
    },
    /**
     * @param {NotifyMessageGR} messageGr
     * @param {string} notifyNumber
     * @param {string} messageID
     * @param {string} phoneNumber
     * @param {string} direction
     * @param {string} body
     * @param {string} status
     * @param {GlideRecord|undefined|null} sourceGr
     */
    onCreateMessageRecord: function(messageGr, notifyNumberSysId, messageID, phoneNumber, direction, body, sourceGr, status) {
        if (status) {
            if (!this.isValidMessageStatus(status)) {
                gs.error("NotifyDatabase: Received unknown message status: " + status);
                status = 'unknown';
            }
        }
        if (!!messageID) {
            messageGr.addQuery('message_id', messageID);
            messageGr.addQuery('phone_number', phoneNumber);
            messageGr.setLimit(1);
            messageGr.query();
            if (messageGr.hasNext()) {
                var id = messageGr.getUniqueValue();
                if (messageGr.getValue('status') != status && this._messageStatusOrder(messageGr.getValue('status')) <= this._messageStatusOrder(status)) {
                    messageGr.setValue('status', status);
                    messageGr.update();
                }
                return id;
            }
        }
        if (!!notifyNumberSysId)
            messageGr.notify_number = notifyNumberSysId;
        if (!!messageID)
            messageGr.message_id = messageID;
        messageGr.direction = direction;
        messageGr.phone_number = phoneNumber;
        messageGr.body = body;
        if (sourceGr) {
            messageGr.table = sourceGr.getTableName();
            messageGr.source = sourceGr.getUniqueValue();
        }
        if (status)
            messageGr.status = status;
    },
    addMessageRecord: function(notifyNumber, messageID, phoneNumber, direction, body, source, status) {
        var grNum;
        if (!!notifyNumber) {
            grNum = this.getNotifyNumberByNumber(notifyNumber);
            if (!grNum) {
                gs.error("NotifyDatabase.addMessageRecord: Given notifyNumber is not in records " + notifyNumber);
                return;
            }
        }
        var messageGr = new GlideRecord(this.TABLE_MESSAGE);
        messageGr.initialize();
        this.onCreateMessageRecord(messageGr, !!grNum && grNum.getUniqueValue(), messageID, phoneNumber, direction, body, source, status);
        return messageGr.insert();
    },
    addMessageRecordByNumberId: function(notifyNumberSysId, messageID, phoneNumber, direction, body, source, status) {
        var messageGr = new GlideRecord(this.TABLE_MESSAGE);
        messageGr.initialize();
        this.onCreateMessageRecord(messageGr, notifyNumberSysId, messageID, phoneNumber, direction, body, source, status);
        return messageGr.insert();
    },
    addChildCallRecord: function( /*String*/ notifyNumber, /*String*/ callSid, /*String*/ parentCallSid, /*String*/ phoneNumber, /*String*/ direction, /*String - Optional*/ type) {
        this._validateDirection(direction);
        var grNum = this.getNotifyNumberByNumber(notifyNumber);
        if (!grNum) {
            gs.error("NotifyDatabase.addChildCallRecord: Given notifyNumber is in records " + notifyNumber);
            return;
        }
        var parentCallGrId = this.getNotifyCallRecordByCallID(parentCallSid);
        if (!parentCallGrId) {
            gs.error("NotifyDatabase.addChildCallRecord: Given parent call is not found with SID " + parentCallSid);
            return;
        }
        return this.addChildCallRecordByIds(grNum.getUniqueValue(), callSid, parentCallGrId, phoneNumber, direction, type);
    },
    addChildCallRecordByIds: function( /*String*/ notifyNumberGrId, /*String*/ callSid, /*String*/ parentCallGrId, /*String*/ phoneNumber, /*String*/ direction, /*String - Optional*/ type) {
        this._validateDirection(direction);
        var callGr = new GlideRecord(this.TABLE_CALL);
        if (callGr.get("call_id", callSid))
            return callGr;
        callGr.initialize();
        callGr.notify_number = notifyNumberGrId;
        callGr.call_id = callSid;
        callGr.parent_call = parentCallGrId;
        callGr.direction = direction;
        callGr.phone_number = phoneNumber;
        if (type)
            callGr.type = type;
        if (callGr.insert())
            return callGr;
    },
    addClientChildCallRecord: function( /*String*/ notifyNumber, /*String*/ callSid, /*String*/ parentCallSid, /*String*/ clientID, /*String*/ direction) {
        var grNum = this.getNotifyNumberByNumber(notifyNumber);
        if (!grNum) {
            gs.error("NotifyDatabase.addClientChildCallRecord: Given notifyNumber is in records " + notifyNumber);
            return;
        }
        var parentCallGrId = this.getNotifyCallRecordByCallID(parentCallSid);
        if (!parentCallGrId) {
            gs.error("NotifyDatabase.addClientChildCallRecord: Given parent call is not found with SID " + parentCallSid);
            return;
        }
        var clientGrId, clientTableName;
        var clientGr = this.getClientRecord(clientID);
        if (clientGr) {
            clientGrId = clientGr.getUniqueValue();
            clientTableName = clientGr.getTableName();
        }
        return this.addClientChildCallRecordByIds(grNum.getUniqueValue(), callSid, parentCallGrId, clientGrId, clientTableName, direction);
    },
    addClientChildCallRecordByIds: function( /*String*/ notifyNumberGrId, /*String*/ callSid, /*String*/ parentCallGrId, /*String*/ clientGrId, /*String*/ clientTableName, /*String*/ direction) {
        this._validateDirection(direction);
        var callGr = new GlideRecord(this.TABLE_CALL);
        if (callGr.get("call_id", callSid))
            return callGr;
        callGr.initialize();
        callGr.notify_number = notifyNumberGrId;
        callGr.call_id = callSid;
        callGr.parent_call = parentCallGrId;
        callGr.direction = direction;
        callGr.type = 'browser';
        callGr.client_table = clientTableName;
        callGr.client = clientGrId;
        if (callGr.insert())
            return callGr;
    },
    setIsHuman: function( /*GlideRecord*/ callRecord, /*Boolean*/ isHuman) {
        // check if the record needs updating
        if (callRecord.is_human === isHuman) {
            // no need to update
            return callRecord;
        }
        // set whether the call was answered by machine or human
        callRecord.setValue("is_human", isHuman);
        callRecord.update();
        // refresh the record and return it
        var refreshedRecord = new GlideRecord(this.TABLE_CALL);
        refreshedRecord.get(callRecord.getUniqueValue());
        return refreshedRecord;
    },
    _getMaxOrder: function( /*String*/ callID) {
        var gr = new GlideRecord(this.TABLE_CALL_STATUS);
        gr.addQuery('notify_call', callID);
        gr.addNotNullQuery('order');
        gr.orderByDesc('order');
        gr.setLimit(1);
        gr.query();
        if (gr.next())
            return parseInt(gr.getValue('order'));
        return 0;
    },
    addInputDigitsCallStatus: function( /*String*/ callSid, /*String*/ digits) {
        var callGr = this.getNotifyCallRecordByCallID(callSid);
        if (callGr) {
            var callRecordID = callGr.getUniqueValue();
            var maxOrder = this._getMaxOrder(callRecordID) + 1;
            // add input record
            var notifyCallStatus = new GlideRecord(this.TABLE_CALL_STATUS);
            notifyCallStatus.initialize();
            notifyCallStatus.setValue('notify_call', callRecordID);
            notifyCallStatus.setValue('status', "input");
            notifyCallStatus.setValue('digits', digits);
            notifyCallStatus.setValue('order', maxOrder);
            if (notifyCallStatus.insert())
                return notifyCallStatus;
        }
    },
    getParticipantRecordFromCallSidIfExists: function( /*String*/ callSid) {
        var callGr = this.getNotifyCallRecordByCallID(callSid);
        if (callGr) {
            var participantSession = new GlideRecord(this.TABLE_PARTICIPANT_SESSION);
            if (participantSession.get('notify_call', callGr.getUniqueValue())) {
                return participantSession.notify_participant.getRefRecord();
            }
        }
        return null;
    },
    getParticipantRecordFromCallSid: function( /*String*/ callSid) {
        var participantRecord = this.getParticipantRecordFromCallSidIfExists(callSid);
        if (participantRecord)
            return participantRecord;
        gs.error("NotifyDatabase.getParticipantRecordFromCallSid: Could not fetch any participant record for call sid " + callSid);
    },
    getParticipantSessionRecordFromCallSid: function( /*String*/ callSid) {
        var callGr = this.getNotifyCallRecordByCallID(callSid);
        if (callGr) {
            var participantSession = new GlideRecord(this.TABLE_PARTICIPANT_SESSION);
            if (participantSession.get('notify_call', callGr.getUniqueValue())) {
                return participantSession;
            }
        }
        gs.error("NotifyDatabase.getParticipantSessionRecordFromCallSid: Could not fetch any participant session record for call sid " + callSid);
    },
    getActiveParticipantSessionRecordFromCallSid: function( /*String*/ callSid) {
        var callGr = this.getNotifyCallRecordByCallID(callSid);
        if (callGr) {
            var participantSession = new GlideRecord(this.TABLE_PARTICIPANT_SESSION);
            participantSession.addActiveQuery();
            participantSession.addQuery('notify_call', callGr.getUniqueValue());
            participantSession.setLimit(1);
            participantSession.query();
            if (participantSession.next())
                return participantSession;
        }
        gs.error("NotifyDatabase.getActiveParticipantSessionRecordFromCallSid: Could not fetch any active participant session record for call sid " + callSid);
    },
    /**
     * @param {NotifyParticipantGR} participantGR
     */
    getParticipantCallInfo: function(participantGR) {
        var participantSessionGR = /**@type {NotifyParticipantSessionGR} */ (new GlideRecord(this.TABLE_PARTICIPANT_SESSION));
        participantSessionGR.addActiveQuery();
        participantSessionGR.addQuery('notify_participant', participantGR.getUniqueValue());
        participantSessionGR.query();
        /**
         * @type {Array<string>}
         */
        var activeCallIds = [];
        while (participantSessionGR.next())
            if (!participantSessionGR.notify_call.nil() && !participantSessionGR.notify_call.call_id.nil())
                activeCallIds.push(participantSessionGR.notify_call.call_id + '');
        return activeCallIds;
    },
    getParticipantSessionRecordForParticipant: function( /*GlideRecord*/ participantRecord) {
        var participantSession = new GlideRecord(this.TABLE_PARTICIPANT_SESSION);
        participantSession.addActiveQuery();
        participantSession.addQuery('notify_participant', participantRecord.getUniqueValue());
        participantSession.query();
        // we expect an active session
        if (participantSession.next())
            return participantSession;
    },
    setConferenceCallParticipantMutedState: function( /*GlideRecord*/ participantRecord, /*Boolean*/ muted) {
        // get the participant session
        var participantSession = this.getParticipantSessionRecordForParticipant(participantRecord);
        if (participantSession) {
            // update the participant
            participantRecord.setValue('muted', muted);
            participantRecord.update();
            // update the participant session
            participantSession.setValue('muted', muted);
            participantSession.update();
        }
    },
    /**
     * @param {NotifyConferenceCallGR} conferenceCall
     * @param {boolean} activeState
     */
    setConferenceCallActiveState: function(conferenceCall, activeState) {
        if (conferenceCall.active === activeState)
            return;
        conferenceCall.setValue('active', activeState);
        if (!activeState) {
            // when the conference call state transitions to inactive, remove the
            // conference call code so no participants can accidentally join after
            // the conference call ended and it will keep conference call code
            // generation snappy
            conferenceCall.setValue('state', NotifyConferenceUtils.prototype.STATE.COMPLETE);
            conferenceCall.setValue('code', 'NULL');
            // calculate the conference call duration
            try {
                var now = new GlideDateTime();
                var duration = new GlideDuration(gs.dateDiff(conferenceCall.getDisplayValue('sys_created_on'), now.getDisplayValue()));
                conferenceCall.setValue('duration', duration.getValue());
            } catch (e) {
                gs.log('could not calculate conference call duration ' + e);
            }
        } else {
            conferenceCall.setValue('state', NotifyConferenceUtils.prototype.STATE.IN_PROGRESS);
        }
        conferenceCall.update();
    },
    /**
     * @param {NotifyParticipantGR} participantRecord
     * @param {boolean} activeState
     */
    setConferenceCallParticipantActiveState: function(participantRecord, activeState) {
        //check for active participant sessions
        if (!activeState && this._checkForActiveSessionsOfAParticipant(participantRecord.getUniqueValue()))
            return;
        var participantStateUpdated = true;
        if ((!!participantRecord.active) !== activeState)
            participantRecord.active = activeState;
        else
            participantStateUpdated = false;
        if (!activeState) {
            participantRecord.muted = false;
            participantRecord.speaking = false;
        } else {
            if (!!participantRecord.muted)
                participantRecord.speaking = false;
            participantRecord.expelled = false;
        }
        participantRecord.update();
        if (participantStateUpdated && !activeState) {
            var confGR = participantRecord.notify_conference_call.getRefRecord();
            if (this.canMakeConferenceCallInActive(confGR))
                this.setConferenceCallActiveState(confGR, false);
        }
    },

    _checkForActiveSessionsOfAParticipant: function(participantRecordSysId) {
        var participantSessionGr = new GlideRecord("notify_participant_session");
        participantSessionGr.addActiveQuery();
        participantSessionGr.addQuery("notify_participant", participantRecordSysId);
        participantSessionGr.setLimit(1);
        participantSessionGr.query();
        return participantSessionGr.hasNext();
    },
    /**
     * @param {NotifyParticipantGR} participantRecord
     */
    getNewParticipantDuration: function(participantRecord) {
        var lastActiveDateTime = null;
        if (!participantRecord.last_active_on.nil())
            lastActiveDateTime = participantRecord.last_active_on.getGlideObject();
        else
            lastActiveDateTime = participantRecord.sys_created_on.getGlideObject();

        if (lastActiveDateTime) {
            var duration = 0;
            if (!participantRecord.duration.nil())
                duration = participantRecord.duration.getGlideObject().getNumericValue();

            var now = new GlideDateTime();
            var activeMilliSeconds = GlideDateTime.subtract(lastActiveDateTime, now).getNumericValue();

            return new GlideDuration(duration + activeMilliSeconds);
        }
    },

    setConferenceCallParticipantAsExpelled: function( /*GlideRecord*/ participantRecord) {
        // get the participant session
        var participantSession = this.getParticipantSessionRecordForParticipant(participantRecord);
        if (participantSession) {
            // update the participant first
            // The expelled participants are marked inactive when they are actually out of the conference as per
            // information from the driver.
            participantRecord.setValue('expelled', true);
            participantRecord.update();
            // update the participant session
            participantSession.setValue('expelled', true);
            participantSession.update();
        }
    },
    setConferenceCallParticipantSpeakingState: function( /*GlideRecord*/ participantRecord, /*Boolean*/ isSpeaking) {
        // update the participant
        participantRecord.setValue('speaking', isSpeaking);
        participantRecord.update();
    },
    /**
     * @param {string} callSid
     * @param {boolean} active
     */
    setConferenceCallParticipantActiveStateByCallSid: function(callSid, active) {
        /**
         * @type {NotifyParticipantSessionGR}
         */
        var participantSessionGr = this.getParticipantSessionRecordFromCallSid(callSid);
        if (!active || (!!participantSessionGr && !!participantSessionGr.active)) {
            var participantGr = participantSessionGr.notify_participant.getRefRecord();
            this.setConferenceCallParticipantActiveState(participantGr, active);
        }
    },
    setConferenceCallParticipantMutedStateByCallSid: function( /*String*/ callSid, /*Boolean*/ muted) {
        // get the participant session
        var participantSession = this.getParticipantSessionRecordFromCallSid(callSid);
        if (participantSession) {
            if (participantSession.active + '' === 'true') { // If not active then let's not sync this state with pariticipant
                var participantRecord = participantSession.notify_participant.getRefRecord();
                // update the participant
                participantRecord.setValue('muted', muted);
                participantRecord.update();
            }
            // update the participant session
            participantSession.setValue('muted', muted);
            participantSession.update();
        }
    },
    setConferenceCallParticipantAsInActiveByCallSid: function( /*String*/ callSid) {
        // get the participant session
        var participantSession = this.getParticipantSessionRecordFromCallSid(callSid);
        if (participantSession) {
            if (participantSession.active + '' === 'true') { // If not active then let's not sync this state with pariticipant
                var participantRecord = participantSession.notify_participant.getRefRecord();
                // update the participant first
                this.setConferenceCallParticipantActiveState(participantRecord, false);
            }
        }
    },
    setConferenceCallParticipantAsExpelledByCallSid: function( /*String*/ callSid) {
        // get the participant session
        var participantSession = this.getParticipantSessionRecordFromCallSid(callSid);
        if (participantSession) {
            if (participantSession.active + '' === 'true') { // If not active then let's not sync this state with pariticipant
                var participantRecord = participantSession.notify_participant.getRefRecord();
                // update the participant first
                participantRecord.setValue('expelled', true);
                participantRecord.setValue('active', false);
                participantRecord.update();
            }
            // update the participant session
            participantSession.setValue('expelled', true);
            participantSession.update();
        }
    },
    setConferenceCallParticipantSpeakingStateByCallSid: function( /*String*/ callSid, /*Boolean*/ isSpeaking) {
        // update the participant
        var participantRecord = this.getParticipantRecordFromCallSid(callSid);
        participantRecord.setValue('speaking', isSpeaking);
        participantRecord.update();
    },
    addConferenceCallParticipantRecord: function( /*GlideRecord*/ conferenceCallRecord, /*GlideRecord*/ callRecord, /*String*/ userSysId, /* String*/ groupSysId, /*boolean*/ isInvited) {
        // get the phone number
        var phoneNumber = callRecord.getValue('phone_number');
        // check if a participant record with this number exists for this conference call
        var participantRecord = new GlideRecord(this.TABLE_PARTICIPANT);
        participantRecord.addQuery('notify_conference_call', conferenceCallRecord.getUniqueValue());
        participantRecord.addQuery('phone_number', phoneNumber);
        participantRecord.query();
        if (!participantRecord.next()) {
            // not yet, insert a participant record
            participantRecord.initialize();
            participantRecord.setValue('notify_conference_call', conferenceCallRecord.getUniqueValue());
            participantRecord.setValue('phone_number', phoneNumber);
            if (userSysId) {
                if (new NotifyUtil().isConferenceLeaderInternal(conferenceCallRecord, userSysId))
                    participantRecord.setValue('host', true);
                participantRecord.setValue('user', userSysId);
            }
            if (groupSysId)
                participantRecord.setValue('group', groupSysId);
            if (isInvited)
                participantRecord.setValue('join_type', 'invited');
            else
                participantRecord.setValue('join_type', 'self_joined');
            participantRecord.insert();
        }
        // check if a session record already exists for this participant call
        var sessionRecord = new GlideRecord(this.TABLE_PARTICIPANT_SESSION);
        sessionRecord.addQuery('notify_participant', participantRecord.getUniqueValue());
        sessionRecord.addQuery('notify_call', callRecord.getUniqueValue());
        sessionRecord.query();
        if (!sessionRecord.next()) {
            sessionRecord.initialize();
            sessionRecord.setValue('notify_participant', participantRecord.getUniqueValue());
            sessionRecord.setValue('notify_call', callRecord.getUniqueValue());
            sessionRecord.insert();
        }
        return participantRecord;
    },
    setHost: function( /*GlideRecord*/ participantRecord, /*Boolean*/ isHost) {
        if (participantRecord.host === isHost)
            return participantRecord;
        participantRecord.setValue("host", isHost);
        participantRecord.update();
        var refreshedRecord = new GlideRecord(this.TABLE_PARTICIPANT);
        refreshedRecord.get(participantRecord.getUniqueValue());
        return refreshedRecord;
    },
    addQueueRecord: function( /*String*/ callSid, /*String*/ queueSid) {
        // get the call record for this notify call
        var callRecord = this.getNotifyCallRecordByCallID(callSid);
        if (callRecord) {
            // check if this call record is always related to this que
            var queueRecord = new GlideRecord(this.TABLE_QUEUE);
            queueRecord.addQuery("notify_call", callRecord.getUniqueValue());
            queueRecord.addQuery("queue_id", queueSid);
            queueRecord.query();
            if (!queueRecord.next()) {
                // it isn't, add it
                queueRecord.initialize();
                queueRecord.setValue("notify_call", callRecord.getUniqueValue());
                queueRecord.setValue("queue_id", queueSid);
                queueRecord.insert();
            }
            return queueRecord;
        }
    },
    deleteQueueRecordsForCallSid: function( /*String*/ callSid) {
        var callRecord = this.getNotifyCallRecordByCallID(callSid);
        if (callRecord) {
            var queueRecord = new GlideRecord(this.TABLE_QUEUE);
            queueRecord.query("notify_call", callRecord.getUniqueValue());
            queueRecord.deleteMultiple();
        }
    },
    addRecording: function( /*String*/ callSid, /*String*/ recordingSid, /*Integer*/ recordingDuration, /*String*/ recordingURL) {
        // get the call record for this notify call
        var callRecord = this.getNotifyCallRecordByCallID(callSid);
        if (callRecord) {
            var recordGr = new GlideRecord(this.TABLE_RECORDING);
            recordGr.addQuery('notify_call', callRecord.getUniqueValue());
            recordGr.addQuery('recording_id', recordingSid);
            recordGr.query();
            if (!recordGr.next()) {
                var duration = new GlideDuration();
                duration.setValue(recordingDuration * 1000);
                recordGr.initialize();
                recordGr.notify_call = callRecord.getUniqueValue();
                recordGr.recording_id = recordingSid;
                recordGr.duration = duration;
                recordGr.url = recordingURL;
                recordGr.insert();
            }
            return recordGr;
        }
    },
    addConfRecording: function( /*String*/ confSid, /*String*/ recordingSid, /*Integer*/ recordingDuration, /*String*/ recordingURL) {
        var confRecord = this.getNotifyConfRecordBySid(confSid);
        if (confRecord) {
            var recordGr = new GlideRecord(this.TABLE_RECORDING);
            recordGr.addQuery('notify_conference_call', confRecord.getUniqueValue());
            recordGr.addQuery('recording_id', recordingSid);
            recordGr.query();
            if (!recordGr.next()) {
                var duration = new GlideDuration();
                duration.setValue(recordingDuration * 1000);
                recordGr.initialize();
                recordGr.notify_conference_call = confRecord.getUniqueValue();
                recordGr.recording_id = recordingSid;
                recordGr.duration = duration;
                recordGr.url = recordingURL;
                recordGr.insert();
            }
            return recordGr;
        }
    },
    popActionJson: function( /*String*/ actionSysId) {
        var actionRecord = new GlideRecord(this.TABLE_ACTION);
        if (actionRecord.get(actionSysId)) {
            var j = actionRecord.getValue('json');
            actionRecord.deleteRecord();
            if (j)
                return j;
        }
    },
    /**
     * @param {PartialStringGR<notify_conference_call>} keyValuePair
     * @param {string=} tableName['notify_conference_call'] - or it's subclass
     * @returns {NotifyConferenceCallGR | Error}
     */
    createConferenceCallGR: function(keyValuePair, tableName) {
        tableName = tableName || this.TABLE_CONFERENCE;
        if (gs.nil(keyValuePair.active))
            keyValuePair.active = true;
        if (gs.nil(keyValuePair.conference_title)) {
            var data = {
                table: keyValuePair.table,
                sysId: keyValuePair.source
            };
            keyValuePair.conference_title = new NotifyUtil().getConferenceTitle(data);
        }

        return this.createRecordFromKeyValuePair(keyValuePair, tableName);
    },
    /**
     * @param {NotifyConferenceCallGR} confGR
     * @param {PartialStringGR<notify_conference_call>} keyValuePair
     */
    updateConferenceCallGR: function(confGR, keyValuePair) {
        return this.updateRecordFromKeyValuePair(confGR, keyValuePair);
    },
    /**
     * @param {{[fieldName: string]: any;}} keyValuePair
     * @param {tableName} string
     */
    createRecordFromKeyValuePair: function(keyValuePair, tableName) {
        if (typeof tableName != 'string')
            return null;
        if (tableName.length == 0)
            return null;
        var gr = new GlideRecord(tableName);
        for (var prop in keyValuePair)
            gr.setValue(prop, keyValuePair[prop]);
        gr.insert();
        return gr;
    },
    /**
     * @param {NotifyConferenceCallGR | NotifyParticipantGR | NotifyParticipantSessionGR} gr
     * @param {{[fieldName:string]: any;}} keyValuePair
     */
    updateRecordFromKeyValuePair: function(gr, keyValuePair) {
        if (!(gr instanceof GlideRecord))
            return '';
        var canUpdate = false;
        for (var prop in keyValuePair) {
            canUpdate = true;
            gr.setValue(prop, keyValuePair[prop]);
        }
        if (!canUpdate)
            return '';
        return gr.update();
    },
    /**
     * @param {PartialStringGR<notify_participant>} keyValuePair
     * @param {string} [tableName='notify_participant'] 'notify_participant' or it's subclass
     */
    createParticipantGR: function(keyValuePair, tableName) {
        tableName = tableName || this.TABLE_PARTICIPANT;
        return this.createRecordFromKeyValuePair(keyValuePair, tableName);
    },
    /**
     * @param {NotifyParticipantGR} participantGR
     * @param {PartialStringGR<notify_participant>} keyValuePair
     */
    updateParticipantGR: function(participantGR, keyValuePair) {
        return this.updateRecordFromKeyValuePair(participantGR, keyValuePair);
    },
    /**
     * @param {PartialStringGR<notify_participant_session>} KeyValuePair
     * @param {string} [tableName='notify_participant_session'] -  'notify_participant_session' or it's subclass
     */
    createParticpantSessionGR: function(keyValuePair, tableName) {
        tableName = tableName || this.TABLE_PARTICIPANT_SESSION;
        return this.createRecordFromKeyValuePair(keyValuePair, tableName);
    },
    /**
     * @param {NotifyParticipantSessionGR} participantSessionGR
     * @param {PartialStringGR<notify_participant>} keyValuePair
     */
    udpateParticipantSessionGR: function(participantSessionGR, keyValuePair) {
        return this.updateRecordFromKeyValuePair(participantSessionGR, keyValuePair);
    },
    /**
     * @param {string} confId
     * @returns {NotifyConferenceCallGR | Error}
     */
    getConferenceGRFromConfId: function(confId) {
        if (typeof confId != 'string')
            throw new Error('Invalid arguments, expecting "string" as confId');
        var confGR = /** @type {NotifyConferenceCallGR} */ (new GlideRecord(this.TABLE_CONFERENCE));
        if (confGR.get(confId))
            return confGR;
        throw new Error('Unable to find conf record from confId');
    },
    /**
     * @param {string} notifyNumber
     */
    getNotifyNumberGRFromNumber: function(notifyNumber) {
        var gr = new GlideRecord('notify_number');
        gr.addQuery('number', notifyNumber);
        gr.query();
        gr.setLimit(1);
        gr.next();
        return gr;
    },
    /**
     * @param {string} userId
     * @returns {string | null}
     */
    getGroupIdFromUserId: function(userId) {
        var groupId = null;
        if (typeof userId != 'string')
            return groupId;
        if (userId.length == 0)
            return groupId;
        var gr = new GlideRecord('sys_user_grmember');
        gr.addQuery('group.active', true);
        gr.addQuery('user', userId);
        gr.query();
        if (gr.next() && !gr.hasNext())
            groupId = gr.getValue('group');
        return groupId
    },
    /**
     * @param {TaskGR} taskGR
     */
    getAssociatedActiveConferencesFromTaskGR: function(taskGR) {
        var confGR = new GlideRecord('notify_conference_call');
        confGR.addActiveQuery();
        confGR.addQuery('source', taskGR.getUniqueValue());
        confGR.orderByDesc('sys_created_on');
        confGR.query();
        return confGR;
    },
    PARTICIPANT_STATE: {
        /**
         * Session - Active
         * Participant -InActive
         */
        CONNECTED_NOT_JOINED: 1,
        /**
         * Session - Active
         * Participant - Active
         */
        JOINED: 2,
        /**
         * Session - InActive
         * Participant - InActive. Left or Never Joined into conference
         */
        NOT_CONNECTED: 3,
    },
    /**
     * @param {NotifyParticipantGR} participantGR
     */
    getParticipantState: function(participantGR) {
        if (participantGR.active)
            return this.PARTICIPANT_STATE.JOINED;

        var sessionGR = new GlideRecord('notify_participant_session');
        sessionGR.addActiveQuery();
        sessionGR.addQuery('notify_participant', participantGR.getUniqueValue());
        sessionGR.setLimit(1);
        sessionGR.query();
        if (sessionGR.hasNext())
            return this.PARTICIPANT_STATE.CONNECTED_NOT_JOINED;
        return this.PARTICIPANT_STATE.NOT_CONNECTED;
    },
    /**
     * @param {NotifyConferenceCallGR} confGR
     */
    canMakeConferenceCallInActive: function(confGR) {
        var participantGR = new GlideRecord('notify_participant');
        participantGR.addQuery('notify_conference_call', confGR.getUniqueValue());
        participantGR.query();
        var state = 0;
        while (participantGR.next()) {
            state = this.getParticipantState(participantGR);
            if ((state === this.PARTICIPANT_STATE.JOINED) || (state === this.PARTICIPANT_STATE.CONNECTED_NOT_JOINED))
                return false;
        }
        return true;
    },

    /**
     * @param {GlideRecord} confRecord
     * @returns {GlideRecord|null}
     */
    _getConfTranscriptRecord: function(confRecord) {
        var transcriptGR = new GlideRecord(this.TABLE_TRANSCRIPT_SUMMARY);
        transcriptGR.addQuery('notify_conference_call', confRecord.getUniqueValue());
        transcriptGR.query();
        if (transcriptGR.next()) return transcriptGR;
        return null;
    },

    /**
     * @param {string} confSid
     * @param {string} transcriptURL
     * @param {string} transcriptId
     * @returns {GlideRecord|null}
     */
    addConfTranscript: function(confSid, transcriptURL, transcriptId) {
        var confRecord = this.getNotifyConfRecordBySid(confSid);
        if (confRecord) {
            var transcriptGR = this._getConfTranscriptRecord(confRecord);
            if (!transcriptGR) {
                transcriptGR = new GlideRecord(this.TABLE_TRANSCRIPT_SUMMARY);
                transcriptGR.initialize();
                transcriptGR.setValue('notify_conference_call', confRecord.getUniqueValue());
                transcriptGR.setValue('transcript_id', transcriptId);
                transcriptGR.setValue('transcript_url', transcriptURL);
                transcriptGR.insert();
            } else if (!transcriptGR.getValue('transcript_id')) {
                transcriptGR.setValue('transcript_id', transcriptId);
                transcriptGR.setValue('transcript_url', transcriptURL);
                transcriptGR.update();
            }
            return transcriptGR;
        }
        return null;
    },


    /**
     * @param {string} confSid
     * @param {string} summary
     * @param {'provider_summary' | 'summary'} column
     * @returns {GlideRecord|null} 
     **/
    addConfTranscriptSummary: function(confSid, summary, column) {
        var confRecord = this.getNotifyConfRecordBySid(confSid);
        if (confRecord) {
            var transcriptGR = this._getConfTranscriptRecord(confRecord);
            if (!transcriptGR) {
                transcriptGR = new GlideRecord(this.TABLE_TRANSCRIPT_SUMMARY);
                transcriptGR.initialize();
                transcriptGR.setValue('notify_conference_call', confRecord.getUniqueValue());
                transcriptGR.setValue(column, summary);
                transcriptGR.insert();
            } else if (!transcriptGR.getValue(column)) {
                transcriptGR.setValue(column, summary);
                transcriptGR.update();
            }
            return transcriptGR;
        }
        return null;
    },

    /**
     * @param {string} confSid
     * @param {string} attachmentSysId
     * @returns {GlideRecord|null}
     **/
    attachConfTranscriptFile: function(confSid, attachmentSysId) {
        var confRecord = this.getNotifyConfRecordBySid(confSid);
        if (confRecord) {
            var transcriptGR = this._getConfTranscriptRecord(confRecord);
            if (transcriptGR) {
                transcriptGR.setValue('attachment', attachmentSysId);
                transcriptGR.update();
                return transcriptGR;
            }
        }
        return null;
    },

    /**
     * @param {string} confSid
     * @returns {GlideRecord|null}
     **/
    getTranscriptByConfId: function(confSid) {
        var confRecord = this.getNotifyConfRecordBySid(confSid);
        if (confRecord) {
            return this._getConfTranscriptRecord(confRecord);
        }
        return null;
    },

    /**
     * @param {GlideRecord} callRecord
     * @returns {GlideRecord|null}
     */
    _getCallTranscriptRecord: function(callRecord) {
        var transcriptGR = new GlideRecord(this.TABLE_TRANSCRIPT_SUMMARY);
        transcriptGR.addQuery('notify_call', callRecord.getUniqueValue());
        transcriptGR.query();
        if (transcriptGR.next()) return transcriptGR;
        return null;
    },

    /**
     * @param {string} callSid
     * @param {string} transcriptURL
     * @param {string} transcriptId
     * @returns {GlideRecord|null} 
     **/
    addCallTranscript: function(callSid, transcriptURL, transcriptId) {
        var callRecord = this.getNotifyCallRecordByCallID(callSid);
        if (callRecord) {
            var transcriptGR = this._getCallTranscriptRecord(callRecord);
            if (!transcriptGR) {
                transcriptGR = new GlideRecord(this.TABLE_TRANSCRIPT_SUMMARY);
                transcriptGR.initialize();
                transcriptGR.setValue('notify_call', callRecord.getUniqueValue());
                transcriptGR.setValue('transcript_id', transcriptId);
                transcriptGR.setValue('transcript_url', transcriptURL);
                transcriptGR.insert();
            } else if (!transcriptGR.getValue('transcript_id')) {
                transcriptGR.setValue('transcript_id', transcriptId);
                transcriptGR.setValue('transcript_url', transcriptURL);
                transcriptGR.update();
            }
            return transcriptGR;
        }
        return null;
    },

    /**
     * @param {string} callSid
     * @param {string} summary
     * @param {'provider_summary' | 'summary'} column
     * @returns {GlideRecord|null}
     **/
    addCallTranscriptSummary: function(callSid, summary, column) {
        var callRecord = this.getNotifyCallRecordByCallID(callSid);
        if (callRecord) {
            var transcriptGR = this._getCallTranscriptRecord(callRecord);
            if (!transcriptGR) {
                transcriptGR.initialize();
                transcriptGR.setValue('notify_call', callRecord.getUniqueValue());
                transcriptGR.setValue(column, summary);
                transcriptGR.insert();
            } else if (!transcriptGR.getValue(column)) {
                transcriptGR.setValue(column, summary);
                transcriptGR.update();
            }
            return transcriptGR;
        }
        return null;
    },

    /**
     * @param {string} callSid
     * @param {string} attachmentSysId
     * @returns {GlideRecord|null}
     **/
    attachCallTranscriptFile: function(callSid, attachmentSysId) {
        var callRecord = this.getNotifyCallRecordByCallID(callSid);
        if (callRecord) {
            var transcriptGR = this._getCallTranscriptRecord(callRecord);
            if (transcriptGR) {
                transcriptGR.setValue('attachment', attachmentSysId);
                transcriptGR.update();
                return transcriptGR;
            }
        }
        return null;
    },

    /** 
     * @param {string} callSid
     * @returns {GlideRecord|null}
     **/
    getTranscriptByCallId: function(callSid) {
        var callRecord = this.getNotifyCallRecordByCallID(callSid);
        if (callRecord) {
            return this._getCallTranscriptRecord(callRecord);
        }
        return null;
    },

    type: 'NotifyDatabase'
};
