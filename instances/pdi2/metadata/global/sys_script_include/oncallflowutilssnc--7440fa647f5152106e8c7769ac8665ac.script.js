var OnCallFlowUtilsSNC = Class.create();
OnCallFlowUtilsSNC.prototype = Object.extendsObject(OnCallWorkflowUtils, {

    initialize: function() {
        OnCallWorkflowUtils.prototype.initialize.call(this);
        this.log = new GSLog('com.snc.on_call_rotation.log.level', "OnCallFlowUtilsSNC");
    },

    addEscalateePerRotaFlow: function(group, rotas, processedPhoneNumbers, processedEscalatees) {
        var scratchpad = {
            group: group,
            rotas: rotas,
            processedPhoneNumbers: processedPhoneNumbers,
            processedEscalatees: processedEscalatees
        };
        var result = this.addEscalateePerRota(scratchpad);
        var returnValue = {
            group: result.group,
            processedPhoneNumbers: result.processedPhoneNumbers,
            processedEscalatees: result.processedEscalatees
        };
        return returnValue;
    },

    getEscalationDetails: function(table, sysId, groupId, gdt) {
        return this._getEscalationDetails(table, sysId, groupId, gdt, []);
    },

    getFilteredEscalationDetails: function(table, sysId, groupId, gdt, processedRotas) {
        return this._getEscalationDetails(table, sysId, groupId, gdt, processedRotas);
    },

    _getEscalationDetails: function(table, sysId, groupId, gdt, processedRotas) {
        var rota = new OnCallRotation();
        if (!gdt) gdt = new GlideDateTime();
        var response = {};
        response.nobodyOncall = false;

        var taskGr;
        if (table && sysId) {
            taskGr = new GlideRecord(table);
            taskGr.get(sysId);
        }

        var escalationPlan = rota.getEscalationPlan(groupId, gdt, null, taskGr);

        if (JSUtil.nil(rota) || JSUtil.nil(rota.getCurrentRotaID())) {
            response.scheduleExists = false;
            return response;
        }

        // Check if we have more people on the escalation lineup
        if (escalationPlan.length > 0) {
            var rotaIds = [];

            var escalatee = escalationPlan[0];

            if (processedRotas.indexOf(escalatee.rotaId) == -1)
                rotaIds.push(escalatee.rotaId);

            for (var i = 0; i < escalatee.additionalEscalatees.length; i++) {
                var additionalEscalatee = escalatee.additionalEscalatees[i];

                if (processedRotas.indexOf(additionalEscalatee.rotaId) == -1)
                    rotaIds.push(additionalEscalatee.rotaId);

            }
            if (rotaIds.length > 0) {
                response.rotaIds = rotaIds;
                response.scheduleExists = true;
                response.message = this._getEscalationNote(taskGr, escalationPlan, []);
            } else {
                response.scheduleExists = false;
            }
            return response;
        } else
            response.nobodyOncall = true; // Schedule exists but no escalatee available
        response.scheduleExists = true;
        return response;
    },

    getContactsForCatchAll: function(rotaId) {
        var onContactPrefUtil = new OnCallContactPreferenceUtil();
        var contacts = onContactPrefUtil.getCatchAllContacts(rotaId);
        this._populateName(contacts);
        return contacts;
    },

    _populateName: function(contacts) {
        for (var i = 0; i < contacts.length; i++) {
            var contact = contacts[i];
            contact.name = '';
            if (contact.type == 'user') {
                var userGr = this._getUserGr(contact.sys_id + '');
                if (userGr)
                    contact.name = userGr.getDisplayValue();
            } else if (contact.type == 'device') {
                var deviceGr = this._getDeviceGr(contact.sys_id + '');
                if (deviceGr)
                    contact.name = deviceGr.getDisplayValue();
            }
        }
    },

    _getUserGr: function(userId) {
        if (!userId)
            return null;
        var userGr = new GlideRecord('sys_user');
        if (userGr.get(userId))
            return userGr;
    },

    _getDeviceGr: function(deviceId) {
        if (!deviceId)
            return null;
        var deviceGr = new GlideRecord('cmn_notif_device');
        if (deviceGr.get(deviceId))
            return deviceGr;
    },

    _getEscalationNote: function(taskGr, escalationPlan, processedRotas) {
        var tableName = taskGr.getTableName().replaceAll('_', ' ');
        var message = gs.getMessage("This {0} escalation is in progress using the following escalation plan:", [tableName]);
        var lineBreak = "\n";
        message += lineBreak;

        var ocwUtils = new OnCallWorkflowUtils();
        var escalatees = ocwUtils.getEscalatees(escalationPlan, processedRotas);
        for (var i = 0; i < escalatees.length; i++) {
            var minutes = Math.floor(escalatees[i].reminderTime / 60);
            var seconds = Math.round((escalatees[i].reminderTime / 60 - minutes) * 60);
            var i18nMsg = (seconds > 0) ? gs.getMessage("Escalate in {0} minutes and {1} seconds to {2}", [minutes.toString(), seconds.toString(), escalatees[i].name]) : gs.getMessage("Escalate in {0} minutes to {1}", [minutes.toString(), escalatees[i].name]);
            message += i18nMsg + lineBreak;
        }
        return message;
    },

    getAcknowledgementInfo: function(sourceGr, subFlowContextId, rejectedUserIds, sentUserIds) {
        var response = {};
        var log = new GSLog('com.snc.on_call_rotation.log.level', "Get Rejected sys ids");
        if (!sourceGr) {
            if (log.atLevel(GSLog.DEBUG)) {
                log.logDebug("Source Gr should not be empty");
            }
            return response;
        }
        if (!sourceGr.isValid()) {
            if (log.atLevel(GSLog.DEBUG)) {
                log.logDebug("Source Gr should be valid");
            }
            return response;
        }
        if (!subFlowContextId) {
            if (log.atLevel(GSLog.DEBUG)) {
                log.logDebug("subFlowContextId should not be empty");
            }
            return response;
        }
        response["rejectedUserIds"] = rejectedUserIds || [];
        var onCallEsc = new OnCallEscalationUtil();
        var users = sentUserIds;

        var gr = new GlideRecord(this.TABLES.ON_CALL_ESCALATION_RESPONSE);
        gr.addQuery('table', sourceGr.getTableName());
        gr.addQuery('source', sourceGr.getUniqueValue());
        gr.addQuery('subflow_context', subFlowContextId);
        gr.addQuery('user', 'IN', sentUserIds.join(','));
        gr.query();

        while (gr.next()) {
            var user = gr.getValue("user");
            var userResponse = gr.getValue("response");
            if (userResponse === onCallEsc.COMMUNICATION_RESPONSE.REJECTED) {
                response["acknowledged"] = false;
                if (response["rejectedUserIds"].indexOf(user) === -1)
                    response["rejectedUserIds"].push(user);
            } else if (userResponse === onCallEsc.COMMUNICATION_RESPONSE.ACCEPTED) {
                response["acknowledged"] = true;
                response["responsedReceived"] = true;
            }
        }

        return response;
    },

    getEscalateeDetailsForEmail: function(escalatee) {
        var res = [];

        if (escalatee.userId) {
            var userObj = this.getUser(escalatee.userId);
            if (userObj) res.push(userObj);
        }

        if (escalatee.userIds) {
            for (var i = 0; i < escalatee.userIds.length; i++) {
                var userObj = this.getUser(escalatee.userIds[i]);
                if (userObj) res.push(userObj);
            }
        }

        if (escalatee.deviceId) {
            var deviceObj = this._getDeviceDetails(escalatee.deviceId);
            if (deviceObj) res.push(deviceObj);
        }

        if (escalatee.deviceIds) {
            for (var i = 0; i < escalatee.deviceIds.length; i++) {
                var deviceObj = this._getDeviceDetails(escalatee.deviceIds[i]);
                if (deviceObj) res.push(deviceObj);
            }
        }

        return res;
    },

    _getDeviceDetails: function(deviceId) {
        var deviceGr = this._getDeviceGr(deviceId);
        if (!gs.nil(deviceGr)) {
            return {
                recordClass: 'cmn_notif_device',
                id: deviceId,
                name: deviceGr.getValue('name'),
                type: deviceGr.getValue('type'),
                email: deviceGr.getValue('email_address'),
                user_id: deviceGr.getValue('user')
            };
        }
        return null;
    },

    getEscalateeEmailPreferences: function(escalateeSysId, contactAttempt, gdt) {
        var onContactPrefUtil = new global.OnCallContactPreferenceUtil();
        var userPrefs = onContactPrefUtil.getUserPreferences(escalateeSysId, contactAttempt, gdt, 'email');

        return userPrefs;
    },

    isSubflow: function(sourceGr, userId) {
        var escResponseGr = new GlideRecord(this.TABLES.ON_CALL_ESCALATION_RESPONSE);
        escResponseGr.addQuery("table", sourceGr.getTableName());
        escResponseGr.addQuery("source", sourceGr.getUniqueValue());
        escResponseGr.addQuery("user", userId);
        escResponseGr.setLimit(1);
        escResponseGr.query();
        if (escResponseGr.next()) {
            return !gs.nil(escResponseGr.getValue("subflow_context"));
        } else {
            var trgrContextGr = new GlideRecord(this.TABLES.TRIGGER_RULE_WF_CONTEXT);
            trgrContextGr.addQuery("document_table", sourceGr.getTableName());
            trgrContextGr.addQuery("document", sourceGr.getUniqueValue());
            trgrContextGr.orderByDesc('sys_updated_on');
            trgrContextGr.setLimit(1);
            trgrContextGr.query();
            if (trgrContextGr.next()) {
                return !gs.nil(trgrContextGr.getValue("subflow_context"));
            }
        }
        return false;

    },

    getEscalationResponses: function(flowContextId) {
        if (!flowContextId)
            return null;
        var escResponseGr = new GlideRecord(this.TABLES.ON_CALL_ESCALATION_RESPONSE);
        escResponseGr.addQuery("subflow_context", "IN", flowContextId);
        escResponseGr.query();

        return escResponseGr;
    },

    _getSubflowContextSysIdBySourceRecord: function(sourceGr, name) {
        var isDebugLogEnabled = this.log.atLevel(GSLog.DEBUG);
        if (!sourceGr) {
            if (isDebugLogEnabled)
                this.log.logDebug("Source Gr should not be empty");
            return null;
        }

        if (gs.nil(name)) {
            if (isDebugLogEnabled)
                this.log.logDebug("Name should not be empty");
            return null;
        }

        if (isDebugLogEnabled)
            this.log.logDebug("SourceGR Table Name: " + sourceGr.getTableName() + " SourceGR SysId: " + sourceGr.getUniqueValue() + " Name: " + name);

        var subFlowContextsGr = sn_fd.FlowAPI.getRunningFlows(sourceGr, false, name);
        if (isDebugLogEnabled)
            this.log.logDebug("SubFlow Contexts Record Count: " + subFlowContextsGr.getRowCount());
        if (subFlowContextsGr.next()) {
            var subflowContextSysId = subFlowContextsGr.getUniqueValue();
            if (isDebugLogEnabled)
                this.log.logDebug("SubFlow Contexts Record Id: " + subflowContextSysId);
            return subflowContextSysId;
        }
        return null;
    },

    _getRecordBySysId: function(tableName, sysId) {
        if (this.log.atLevel(GSLog.DEBUG))
            this.log.logDebug("Table: " + tableName + " SysId: " + sysId);
        if (gs.nil(tableName) || gs.nil(sysId) || !gs.tableExists(tableName))
            return null;
        var recordGr = new GlideRecord(tableName);
        recordGr.get(sysId);
        return recordGr;
    },

    resumeConferenceCallEscalation: function(conferenceSysID) {
        var isDebugLogEnabled = this.log.atLevel(GSLog.DEBUG);

        if (isDebugLogEnabled)
            this.log.logDebug("Conference call SysId: " + conferenceSysID);

        if (gs.nil(conferenceSysID))
            return;

        var conferenceCallGr = new GlideRecord('notify_conference_call');
        if (conferenceCallGr.get(conferenceSysID)) {
            var confMainContextSysId = this._getSubflowContextSysIdBySourceRecord(conferenceCallGr, "On-Call: Conference Call Escalation Main");

            if (isDebugLogEnabled)
                this.log.logDebug("On-Call: Conference Call Escalation Main Context sysId: " + confMainContextSysId);

            if (gs.nil(confMainContextSysId))
                return;

            var confMainContextGr = this._getRecordBySysId('sys_flow_context', confMainContextSysId);
            if (confMainContextGr) {

                var confEscalationContextSysId = this._getSubflowContextSysIdBySourceRecord(confMainContextGr, "On-Call: Conference Call Escalation SNC");

                if (isDebugLogEnabled)
                    this.log.logDebug("On-Call: Conference Call Escalation SNC Context sysId: " + confEscalationContextSysId);

                if (gs.nil(confEscalationContextSysId))
                    return;

                sn_fd.FlowAPI.sendMessage(confEscalationContextSysId, 'RESUME_CONFERENCE_CALL_ESCALATION_MAIN', 'RESUME_CONFERENCE_CALL_ESCALATION_MAIN');
            } else {
                if (isDebugLogEnabled)
                    this.log.logDebug("Flow Content Gr is not valid for SysId: " + confMainContextSysId);
            }
        }
    },

    type: 'OnCallFlowUtilsSNC'
});
