var NotifyOnTaskAjaxProcessor = Class.create();
NotifyOnTaskAjaxProcessor.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    notify          : new SNC.Notify(),
    notifyUtils     : new NotifyUtil(),
    arrayUtil       : new ArrayUtil(),
    source_table    : null,
    task_id         : null,
    numbers         : [],
    _errorMessages  : [],
    _successMessages: [],
    _warnMessages   : [],
    _addToWorkNotes : false,
    _result         : {status: 1, errorMessages: [], warnMessages:[], successMessages: []},

	process: function () {
		if (!gs.getUser().hasRoles())
			return;

		if (this.notifyUtils.isConferenceLeader && this.source_table && this.task_id) {
			var isConfLeader = false;
			var sourceGr = new GlideRecord(this.source_table);
			if (sourceGr.get(this.task_id))
				isConfLeader = this.notifyUtils.isConferenceLeader(sourceGr);
			if (!isConfLeader)
				return;	
		}

		return global.AbstractAjaxProcessor.prototype.process.apply(this, arguments);
	},

    /**
     * Check if a phone number is E.164 compliant
     *
     * @returns {boolean}
     */
    isValidE164CompliantPhoneNumber: function() {
        try {
            var jsonData = this.getParameter("sysparm_data");
            var dataObj = new JSON().decode(jsonData);
            var number = dataObj.phone_number;

            if (!this.notifyUtils.isDefined(number))
                return false;

            // fix number
            number = number.replace(/^([0]{2})/, '');   // remove trailing 00
            number = number.replace(/^([^\+])/, '+$1'); // prefix with + if needed

            // get GlideElementPhoneNumber instance (if possible)
            var gep = new GlideElementPhoneNumber();
            if (gep.setPhoneNumber(number, true))
                return true;
        } catch (e) {
			gs.error('Error while checking E164 compliance ' + e);
		}

        return false;
    },

    sendSmsAjax: function() {
        try {
            var jsonData = this.getParameter("sysparm_data");
            var dataObj = new JSON().decode(jsonData);
            this._initFields(dataObj);
            try {
                this.processSMS(dataObj.notify, dataObj.form);
            } catch(e) {
                this._getResult().status = 1;
                this._getResult().errorMessage = e.toString();
                this._addErrorMessage("An error occurred sending the SMS.  Please verify your messages sent or contact your administrator.");
            }
        } catch(e) {
            this._getResult().status = 1;
            this._getResult().errorMessage = e.toString();
        }

        return this._getResultJson();
    },

    initConferenceCallAjax: function() {
        try {
            var jsonData = this.getParameter("sysparm_data");
            var dataObj = new JSON().decode(jsonData);
            this._initFields(dataObj);

            try {
                var conference = this.processConference(dataObj.form);
                if (conference != null && conference.isValidRecord())
                    this._addSuccessMessage(gs.getMessage("The conference call {0} has been started.", conference.number));
            } catch(e) {
                this._getResult().status = 1;
                this._getResult().errorMessage = e.toString();
            }
        } catch(e) {
            this._getResult().status = 1;
            this._getResult().errorMessage = e.toString();
        }
        return this._getResultJson();
    },

    _getResultJson: function() {
        var result = this._getResult();
        if (this._errorMessages.length > 0) {
            result.errorMessages = this._errorMessages;
        }

        if (this._successMessages.length > 0) {
            result.successMessages = this._successMessages;
        }

        if (this._warnMessages.length > 0) {
            result.warnMessages = this._warnMessages;
        }


        var resultJson = new JSON().encode(result);
        return resultJson;
    },

    _getResult: function() {
        return this._result;
    },

    _initFields: function(data) {
        this.source_table = data.form.source_table;
        this.task_id = data.form.task_id;
        this._addToWorkNotes = data.notify.addToWorkNotes;
    },

    processSMS: function(notifyData, formData) {
        var task = new GlideRecord(this.source_table);
        task.get(this.task_id);
        var sentMessages = 0;
        var participants = this._getParticipants(formData, this.notifyUtils.numberType.sms);
        var numbers = participants.numbers;
        var smsed = []; // make sure we send only one sms per number

        // get notify number
        var notifyNumber = null;
        try {
            notifyNumber = this.notifyUtils.getNotifyOnTaskOutboundPhoneNumber();
			this.notifyUtils.validateOutboundNotifyPhoneNumber_throws(notifyNumber);
        } catch (e) {
            this._addErrorMessage(gs.getMessage('Could not send SMS message(s) ({0})', [e]));
            numbers = [];
        }

        for (var i = 0; i < numbers.length; i++) {
            var p = numbers[i];
            // check if the user has a valid number
            if (p.valid && !this.arrayUtil.contains(smsed, p.number)) {
            // try to send a SMS
                sentMessages++;
            } else {
                // could not sent the SMS due to errors
                p.valid = false;
                this._addErrorMessage(gs.getMessage("Skipped invalid number {0} while sending SMS", p.number));
            }
			smsed.push(p.number);
        }
        this.notify.sendBulkSMS(notifyNumber, smsed, formData.message_text, task);

        if (sentMessages > 0) {
            this._addSuccessMessage(gs.getMessage("Message was sent to {0} recipient(s)", sentMessages + ''));

            if (this._addToWorkNotes) {
                this._addWorkNoteMessage("sms", task, participants.numbers, formData.message_text);
            }
        }
    },

    _getParticipants: function(formData, type) {
        var participants = [];
        var adHocNumbers = [];

        try {
            var fields = new JSON().decode(formData.available_users);

            for (var field in fields) {
                if (!JSUtil.nil(formData[field]) && formData[field] === "true") {
                    if (fields.hasOwnProperty(field))
                        participants.push(fields[field].value);
                }
            }

            if (formData.other === "true" && formData.custom_users !== "") {
                var customUserList = formData.custom_users.split(",");
                for (var i = 0; i < customUserList.length; i++) {
                    var gr = new GlideRecord("sys_user");
                    if (gr.get(customUserList[i])) {
                        participants.push(customUserList[i]);
                    } else {
                        adHocNumbers.push(customUserList[i]);
                    }
                }
            }

            this.numbers = this.getNumbers(participants, adHocNumbers, type);
        } catch(e) {
            gs.error(e);
            throw e;
        }

        return {numbers: this.numbers, participants: participants, adHocNumbers: adHocNumbers};
    },

    processConference: function(formData) {
        var task = new GlideRecord(this.source_table);
        task.get(this.task_id);

        var participants = this._getParticipants(formData, this.notifyUtils.numberType.voice);
        var cleanedParticipants = participants.numbers;
        var conferenceCallRecord = cleanedParticipants.length ? this.notify.conferenceCall(task) : [];
        var called = []; // make sure we call only once

        // get notify number
        var notifyNumber = null;
        try {
            notifyNumber = this.notifyUtils.getNotifyOnTaskOutboundPhoneNumber();
			this.notifyUtils.validateOutboundNotifyPhoneNumber_throws(notifyNumber);
        } catch (e) {
            this._addErrorMessage(gs.getMessage('Could not call conference call participants ({0})', [e]));
            cleanedParticipants = [];
        }

        for (var i = 0; i < cleanedParticipants.length; i++) {
            var p = cleanedParticipants[i];
            if (p.valid && !this.arrayUtil.contains(called, p.number)) {
                this.notify.call(notifyNumber, p.number, conferenceCallRecord, (JSUtil.nil(p.sysId) ? null : p.sysId), null, task);
                called.push(p.number);
            }
        }
        if (cleanedParticipants.length > 0 && this._addToWorkNotes) {
            this._addWorkNoteMessage("conference", task, participants.numbers, "");
        }
        return conferenceCallRecord;
    },

    getNumbers: function(participants, adHocNumbers, type) {
        this.notifyUtils.resetErrors();

        var toSend = [];
        for (var j = 0; j < adHocNumbers.length; j++) {
            toSend.push({type: "n", number: adHocNumbers[j], valid: true});
        }

        var data = this.notifyUtils.getUniquePhoneNumbersForUsersAndGroups([], participants, [], type, true);
        toSend = toSend.concat(data.result);

        var errors = this.notifyUtils.getErrors();
        for (var i = 0; i < errors.length; i++) {
            this._addErrorMessage(errors[i]);
        }

        return toSend;
    },

    _addWorkNoteMessage: function(type, task, recipients, message) {
        var userRecs = [];
        var adHoc = [];
        for (var i=0; i < recipients.length; i++) {
            if (recipients[i].valid) {
                if (recipients[i].type == "u" ) {
                    userRecs.push(recipients[i].sysId);
                }else if (recipients[i].type == "n") {
                    adHoc.push(recipients[i]);
                }
            }
        }

        var friendlyUserNames = "";
        var users = new GlideRecord("sys_user");
        users.addQuery("sys_id", "IN", userRecs.toString());
        users.query();

        while (users.next()) {
            friendlyUserNames += users.name;
            if (users.hasNext())
                friendlyUserNames += ", ";
        }

        for (i=0; i < adHoc.length; i++) {
            if (friendlyUserNames !== "") {
                friendlyUserNames += ", ";
            }

            friendlyUserNames += 'Entered Number: ' + adHoc[i].number;
        }

        var worknotes = "";

        if (type == "sms") {
            worknotes = gs.getMessage("Notify SMS was sent.");
			worknotes += "\n";
            worknotes += gs.getMessage("Recipients: {0}", friendlyUserNames);
        } else if (type == "conference") {
            worknotes = gs.getMessage("Notify conference call was started.");
			worknotes += "\n";
            worknotes += gs.getMessage("Participants: {0}", friendlyUserNames);
        }

        if (message !== "") {
			worknotes += "\n";
            worknotes += gs.getMessage("Message: {0}", message);
		}

        task.work_notes = worknotes;
        task.update();
    },

    _addErrorMessage: function(message) {
        this._errorMessages.push(message);
    },

    _addWarnMessage: function(message) {
        this._warnMessages.push(message);
    },

    _addSuccessMessage: function(message) {
        this._successMessages.push(message);
    },

    type: 'NotifyOnTaskAjaxProcessor'
});
