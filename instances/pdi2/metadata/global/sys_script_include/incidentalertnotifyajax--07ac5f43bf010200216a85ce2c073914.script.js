var IncidentAlertNotifyAjax = Class.create();
IncidentAlertNotifyAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    notify: new SNC.Notify(),
    notifyUtils: new NotifyUtil(),
    arrayUtils: new ArrayUtil(),
    onCall: (pm.isRegistered('com.snc.on_call_rotation')) ? this.onCall = new OnCallRotation() : null,

    /**
     * Get recommended participants and add them to the response payload
     */
    getRecommendedParticipants: function() {
        //this.blaInitialize();
        var incidentAlertID = this.getParameter('sysparm_id') + '';
        var contacts = [];
        var grpObj = {};

        // get the incident alert contacts (individual contacts)
        var incidentAlertContacts = this._getIncidentAlertContacts(incidentAlertID);
        contacts = this.notifyUtils.appendUniquely(contacts, incidentAlertContacts);

        // get the incident alert group contact (on call resources for groups)
        var incidentAlertGroupContacts = this._getIncidentAlertGroupContacts(incidentAlertID);
        contacts = this.notifyUtils.appendUniquely(contacts, incidentAlertGroupContacts);

        // get the active conference call for this incident alert (if any)
        var conferenceCall = this._getActiveConferenceCallForIncidentAlert(incidentAlertID);
        if (typeof conferenceCall !== 'undefined') {
            // get all numbers or users that are currently active
            // on this conference call
            var active = this._getActiveParticipants(conferenceCall.getUniqueValue());
            contacts = this.notifyUtils.removeFromArray(contacts, active);
        }
        // add host to the conference call
        var host = gs.getUserID();
        var hostPresent = this.arrayUtils.contains(contacts, host);
        if (!hostPresent) {
            contacts = this.notifyUtils.appendUniquely(contacts, contacts.push(host));
        }

        // iterate over contacts and add them to the payload
        for (var i = 0; i < contacts.length; i++) {
            var contact = contacts[i];
            var additionalInformation = '';

            // check if the contact is an object
            if (typeof contact === 'object') {
                // this is an on call resource
                var level = contact.level;
                var group = contact.group;
                var grpId = contact.groupId + "";
                // set the contact to be the id
                contact = contact.id;

                // create additional information for this on call resource
                switch (level) {
                    case 1:
                        additionalInformation = gs.getMessage(' (1st {0})', [group]);
                        break;
                    case 2:
                        additionalInformation = gs.getMessage(' (2nd {0})', [group]);
                        break;
                    case 3:
                        additionalInformation = gs.getMessage(' (3rd {0})', [group]);
                        break;
                    default:
                        additionalInformation = gs.getMessage(' ({0}th {1})', [level, group]);
                }
                grpObj[contact + ""] = grpId;
            }

            // determine the type of contact
            //var isContact = this.arrayUtils.contains(incidentAlertContacts, contact);
            //var isGroupContact    = this.arrayUtils.contains(incidentAlertGroupContacts   , contact);
            //var isFrequentContact = this.arrayUtils.contains(frequentlyCalledParticipants , contact);

            // determine to show left or right and color
            var side = (contact === host) ? 'right' : 'left';
            var color = 'black'; // default to black

            // get the user (if any)
            var user = this._getUserByID(contact);
            var name = (JSUtil.notNil(user) ? user.name : contact) + additionalInformation;

            // if it's a user, try to see if he/she has any numbers available
            if (JSUtil.notNil(user)) {
                // lookup the voice numbers for this contact
                var numbers = this.notifyUtils.getUniquePhoneNumbersForUsersAndGroups([], [contact], [], this.notifyUtils.numberType.voice);
                if (numbers.length == 0)
                    color = 'tomato'; // has no number, mark as red
            }

            // build the response payload
            var payload = this.newItem('participant');
            payload.setAttribute('side', side);
            payload.setAttribute('name', name);
            payload.setAttribute('color', color);
            payload.setAttribute('sys_id', JSUtil.notNil(user) ? user.getUniqueValue() : contact);
        }
        var grpPayLoad = this.newItem('grpObj');
        grpPayLoad.setAttribute('grp_obj', JSON.stringify(grpObj));
    },

    /**
     * Initiate a conference call
     */
    initiateConferenceCall: function() {
        // define our AJAX XML response root node
        var payload = this.newItem('conference_call');
        payload.setAttribute('success', 'false');

        // get participants
        var participants = this.getParameter('sysparm_participants');
        participants = (JSUtil.notNil(participants)) ? participants.split(',') : [];
        var grpList = JSON.parse(this.getParameter('sysparm_group'));

        // if we have any participants, set up the conference call
        if (participants.length > 0) {
            var incidentAlert = this._getRecordBySysID('incident_alert', this.getParameter('sysparm_id'));
            var ccCheck = new GlideRecord('notify_conference_call');
            ccCheck.addQuery("active", true);
            ccCheck.addQuery("source", incidentAlert.sys_id);
            ccCheck.query();
            if (ccCheck.hasNext()) {
                gs.addErrorMessage(gs.getMessage('An active call for this Incident Communication Plan already exists. You can join the conference call after reloading the form'));
                return;
            }
            var conferenceCall = this.notify.conferenceCall(incidentAlert);

            // iterate over participants
            var success = 0;
            var groupId;
            for (var i = 0; i < participants.length; i++) {
                // and set up a call
                groupId = "";
                if (!JSUtil.nil(grpList[participants[i] + '']))
                    groupId = grpList[participants[i] + ''];
                else {
                    var gr = new GlideRecord('sys_user_grmember');
                    gr.addQuery('group.active', true);
                    gr.addQuery('user', participants[i] + '');
                    gr.query();
                    if (gr.next() && !gr.hasNext())
                        groupId = gr.getValue('group');

                }
                if (this._call(participants[i] + '', conferenceCall, groupId))
                    success++;
            }

            // success?
            if (success > 0) {
                // add info message
                gs.addInfoMessage(gs.getMessage('<a href="{0}">Conference call {1} initiated</a>', [conferenceCall.getLink(), conferenceCall.number]));

                // update the payload to success and add the parameters
                payload.setAttribute('conferenceCallLink', conferenceCall.getLink());
                payload.setAttribute('conferenceCallNumber', conferenceCall.number);
                payload.setAttribute('success', 'true');
            } else {
                // no valid participants
                conferenceCall.setValue('active', false);
                conferenceCall.update();

                gs.addErrorMessage(gs.getMessage('You tried to initiate a conference call without any valid participants'));
            }
        }
    },

    /**
     * End the conference call
     */
    endConference: function() {
        var participant = new GlideRecord('notify_participant');
        participant.addQuery('active', true);
        participant.addQuery('notify_conference_call', this.getParameter('sysparm_conferenceId'));
        participant.query();
        while (participant.next()) {
            this.notify.kick(participant);
        }
        return true;
    },

    /**
     * Add new participants to a conference call
     */
    addToConferenceCall: function() {
        // define our AJAX XML response root node
        var payload = this.newItem('conference_call_participant');
        payload.setAttribute('success', 'false');

        // get participants
        var participants = this.getParameter('sysparm_participants');
        participants = (JSUtil.notNil(participants)) ? participants.split(',') : [];

        // if we have any participants, set up the conference call
        if (participants.length > 0) {
            var conferenceCall = this._getRecordBySysID('notify_conference_call', this.getParameter('sysparm_ccid'));
            if (!conferenceCall.active) {
                gs.addErrorMessage(gs.getMessage('The conference call you are trying to join has ended. You can initiate another one after reloading the form'));
                return;
            }
            var activeParticipants = [];
            var existing = new GlideRecord('notify_participant');
            existing.addActiveQuery();
            existing.addQuery('notify_conference_call', conferenceCall.getUniqueValue());
            existing.query();
            while (existing.next())
            	activeParticipants.push(existing.getValue('user'));

            // iterate over participants
            var success = 0;
            for (var i = 0; i < participants.length; i++) {
                if (activeParticipants.indexOf(participants[i] + '') < 0 && this._call(participants[i] + '', conferenceCall))
                    success++;
            }

            // success?
            if (success > 0) {
                // update the payload to success
                payload.setAttribute('success', 'true');
            } else {
                gs.addErrorMessage(gs.getMessage('You tried to add invalid participants to the conference call'));
            }
        }
    },

    /**
     * Validate a phone number and / or a user id
     */
    validateUserOrNumber: function() {
        // get parameters
        var userID = this.getParameter('sysparm_user_id');
        var phoneNumber = this.getParameter('sysparm_number');
        this._validateAndGetParticipants(userID, phoneNumber);
    },

    /**
     * Validate a phone number/user/group and get the on call participants for the group
     */
    validateAndGetParticipants: function() {
        // get parameters
        var userID = this.getParameter('sysparm_user_id');
        var phoneNumber = this.getParameter('sysparm_number');
        var groupId = this.getParameter('sysparm_group_id');
        this._validateAndGetParticipants(userID, phoneNumber, groupId);
    },

    /** private methods **/
    _validateAndGetParticipants: function(userID, phoneNumber, groupId) {
        var payload = this.newItem('validated');
        payload.setAttribute('user_valid', "false");
        payload.setAttribute('number_valid', "false");
        payload.setAttribute('group_valid', "false");
        var user;
        var numbers;
        if (JSUtil.notNil(phoneNumber)) {
            var phone = new GlideElementPhoneNumber();
            if (phone.setPhoneNumber(phoneNumber, true)) {
                payload.setAttribute('number_valid', phone.getValue());
                user = this.notifyUtils.getUserByNumber(phoneNumber, true);
                if (user && this._isUserActive(user.sys_id)) {
                    payload.setAttribute('number_user', user.sys_id);
                    payload.setAttribute('number_user_display', user.name);
                }
            }
        }

        // validate user
        if (JSUtil.notNil(userID)) {
            if (JSUtil.notNil(this._getUserByID(userID))) {
                numbers = this.notifyUtils.getUniquePhoneNumbersForUsersAndGroups([], [userID], [], this.notifyUtils.numberType.voice);
                if (numbers.length > 0)
                    payload.setAttribute('user_valid', 'true');
            }
        }

        if (JSUtil.notNil(groupId)) {
            var grpGr = new GlideRecord('sys_user_group');
            grpGr.get(groupId);
            var contacts = this._getOnCallResourcesForGroup(grpGr);
            if (contacts.length > 0)
                payload.setAttribute('group_valid', 'true');
            // iterate over contacts and add them to the payload
            for (var i = 0; i < contacts.length; i++) {
                var contact = contacts[i];
                var additionalInformation;
                var level = contact.level;
                var group = contact.group;
                contact = contact.id;
                // create additional information for this on call resource
                switch (level) {
                    case 1:
                        additionalInformation = gs.getMessage(' (1st {0})', [group]);
                        break;
                    case 2:
                        additionalInformation = gs.getMessage(' (2nd {0})', [group]);
                        break;
                    case 3:
                        additionalInformation = gs.getMessage(' (3rd {0})', [group]);
                        break;
                    default:
                        additionalInformation = gs.getMessage(' ({0}th {1})', [level, group]);
                }
                var color = 'black'; // default to black
                // get the user (if any)
                user = this._getUserByID(contact);
                var name = (JSUtil.notNil(user) ? user.name : contact) + additionalInformation;

                // if it's a user, try to see if he/she has any numbers available
                if (JSUtil.notNil(user)) {
                    // lookup the voice numbers for this contact
                    numbers = this.notifyUtils.getUniquePhoneNumbersForUsersAndGroups([], [contact], [], this.notifyUtils.numberType.voice);
                    if (numbers.length == 0)
                        color = 'tomato'; // has no number, mark as red
                }

                // build the response payload
                var onCallpayload = this.newItem('on_call_participant');
                onCallpayload.setAttribute('name', name);
                onCallpayload.setAttribute('color', color);
                onCallpayload.setAttribute('sys_id', JSUtil.notNil(user) ? user.getUniqueValue() : contact);
            }
        }
    },

    /**
     * Add a participant into a conference call
     *
     * @param participant
     * @param conferenceCall
     * @returns {boolean}
     * @private
     */
    _call: function(participant, conferenceCall, groupId) {
        var user = this._getUserByID(participant);
        var from = gs.getProperty('com.snc.iam.notify_number', '').trim();
        var to;

        // got a from number?
        if (JSUtil.nil(from)) {
            gs.addErrorMessage(gs.getMessage('Configure com.snc.iam.notify_number property to contain the Notify number to use'));
            return false;
        }

        // define the number to call
        if (JSUtil.notNil(user)) {
            // participant is a user
            var numbers = this.notifyUtils.getUniquePhoneNumbersForUsersAndGroups([], [participant], [], this.notifyUtils.numberType.voice);
            if (numbers.length > 0)
                to = numbers[0];
        } else {
            // participant is a phone number
            to = participant;
        }

        // got a number?
        if (JSUtil.notNil(to)) {
            // add to conference call
            this.notify.call(from, to, conferenceCall, (JSUtil.nil(user) ? null : user.getUniqueValue()), (JSUtil.nil(groupId) ? null : groupId));
            return true;
        } else {
            gs.addErrorMessage(gs.getMessage('participant {0} could not be added to conference call {1}', [(JSUtil.notNil(user) ? user.name : participant), conferenceCall.getValue('number')]));
            return false;
        }
    },


    /**
     * Get all active participants for a conference call
     *
     * @param conferenceCallID
     * @returns {Array} (phone numbers and user ids)
     * @private
     */
    _getActiveParticipants: function(conferenceCallID) {
        var contacts = [];

        // get all active participants
        var participant = new GlideRecordSecure('notify_participant');
        participant.addActiveQuery();
        participant.query('notify_conference_call', conferenceCallID);

        // iterate over participants
        while (participant.next()) {
            var user;
            var number = participant.getValue('phone_number');
            if (participant.getValue('user')) {
                user = participant.getValue('phone_number');
            } else {
                user = this.notifyUtils.getUserByNumber(number);
            }

            if (typeof user !== 'undefined')
                contacts.push(user);
            else
                contacts.push(number);
        }

        return contacts;
    },

    /**
     * Get the (most recent) active conference call by IA ID
     *
     * @param incidentAlertID
     * @returns {GlideRecord}
     * @private
     */
    _getActiveConferenceCallForIncidentAlert: function(incidentAlertID) {
        var conferenceCall = new GlideRecordSecure('notify_conference_call');
        conferenceCall.addActiveQuery();
        conferenceCall.setLimit(1);
        conferenceCall.orderByDesc('sys_created_on');
        conferenceCall.addQuery('table', 'incident_alert');
        conferenceCall.query('source', incidentAlertID);
        if (conferenceCall.next())
            return conferenceCall;
    },

    /**
     * Get all contacts (users) for an Incident Alert record
     *
     * @param incidentAlertID
     * @returns {Array}
     * @private
     */
    _getIncidentAlertContacts: function(incidentAlertID) {
        var contacts = [];

        // get (group) contacts for this incident alert
        var contact = new GlideRecordSecure('contact');
        contact.addQuery('table', 'incident_alert');
        contact.query('document', incidentAlertID);

        // iterate over (group) contacts
        while (contact.next()) {
            if (JSUtil.notNil(contact.user) && contact.user.active == true)
                contacts.push(contact.user + '');
        }

        return contacts;
    },

    /**
     * Get all group contacts (on call resources for those groups)
     * for an Incident Alert Record
     *
     * @param incidentAlertID
     * @returns {Array}
     * @private
     */
    _getIncidentAlertGroupContacts: function(incidentAlertID) {
        var contacts = [];

        // get (group) contacts for this incident alert
        var contact = new GlideRecordSecure('contact');
        contact.addQuery('table', 'incident_alert');
        contact.query('document', incidentAlertID);

        // iterate over (group) contacts
        while (contact.next()) {
            if (JSUtil.nil(contact.user) && JSUtil.notNil(contact.group) && contact.group.active == true)
                contacts = this.notifyUtils.appendUniquely(contacts, this._getOnCallResourcesForGroup(contact.group));
        }

        return contacts;
    },

    /**
     * Get all on call resources for a particular group
     *
     * @param group
     * @returns {Array}
     * @private
     */
    _getOnCallResourcesForGroup: function(group) {
        var contacts = [];

        // check if On Call Rotation is installed
        if (this.onCall && this._groupHasRotas(group)) {
            // get the escalation plan
            var depth = gs.getProperty("com.snc.iam.on_call_escalation_level", 2);
            var escalationPlan = this.onCall.getEscalationPlan(group.sys_id, new GlideDateTime());
            var planSize = escalationPlan.size();
            var displayPlanSize = ((depth == -1) || (depth >= planSize)) ? planSize : depth;
            // iterate over contacts in the escalation plan
            for (var i = 0; i < displayPlanSize; i++) {
                var contact = escalationPlan.get(i);
                var level = contact.order;
                if (this._isUserActive(contact.userId + '')) {
                    contacts.push({
                        id: contact.userId + '',
                        level: level,
                        group: group.name,
                        groupId: group.sys_id
                    });
                }
            }
        }
        return contacts;
    },

    _isUserActive: function(userId) {
        var gr = new GlideRecord("sys_user");
        return gr.get(userId) && gr.active == true;
    },
    /**
     * Check if a group has On Call Rota's configured
     *
     * @param group
     * @returns {*}
     * @private
     */
    _groupHasRotas: function(group) {
        if (JSUtil.notNil(group)) {
            var rota = new GlideRecord('cmn_rota');
            rota.addActiveQuery();
            rota.query('group', group.sys_id);
            return rota.next();
        }

        return false;
    },

    /**
     * Get a user record by sys id
     *
     * @param id
     * @returns {GlideRecord}
     * @private
     */
    _getUserByID: function(id) {
        return this._getRecordBySysID('sys_user', id);
    },

    /**
     * Get a record by sys id
     *
     * @param table
     * @param id
     * @returns {GlideRecord}
     * @private
     */
    _getRecordBySysID: function(table, id) {
        var record = new GlideRecord(table);
        if (record.get(id))
            return record;
    },

    type: 'IncidentAlertNotifyAjax'
});
