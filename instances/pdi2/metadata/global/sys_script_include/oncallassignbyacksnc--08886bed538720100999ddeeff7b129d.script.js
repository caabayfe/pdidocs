var OnCallAssignByAckSNC = Class.create();

OnCallAssignByAckSNC.prototype = {
    ASSIGNMENT_GROUP: 'assignment_group',
    ASSIGNED_TO: 'assigned_to',
    DOCUMENT: 'document',
    DOCUMENT_TABLE: 'document_table',
    SYS_CREATED_ON: 'sys_created_on',
    TABLE: 'table',
    TRIGGER_USER_FIELD: 'trigger_user_field',
    TRIGGER_GROUP_FIELD: 'trigger_group_field',
    TRIGGER_RULE_WF_CONTEXT: 'trigger_rule_wf_context',
    WF_CONTEXT: 'wf_context',
    SUBFLOW_CONTEXT: 'subflow_context',
    SYS_FLOW_CONTEXT: 'sys_flow_context',
    PARENT_SUBFLOW_CONTEXT: 'parent_subflow_context',
    ACCEPT: 'ACC',
    REJECT: 'REJ',
    RESUME: 'resume',
    PARENT: 'parent',
    ON_CALL_ESCALATION_RESPONSE: 'on_call_escalation_response',
    FLOW_CONTEXT_INACTIVE_STATES: ["COMPLETE", "ERROR", "PRESUMED_INTERRUPTED", "CANCELLED", "QUEUED"],
    SYSTEM: 'system',

    initialize: function() {
        this._escalationUtil = new OnCallEscalationUtil();
        this._onCallWorkflowUtils = new OnCallWorkflowUtils();
        this._log = new GSLog('com.snc.on_call_rotation.log.level', this.type);
        this._isSubflow = false;
    },

    process: function() {
        var hasValidUserAndRecord = this._hasValidUserAndRecord();

        if (this._log.atLevel(GSLog.DEBUG))
            this._log.logDebug('[process] hasValidUserAndRecord: ' + hasValidUserAndRecord);

        if (!hasValidUserAndRecord)
            return;

        // process user response
        if (this._userResponse && this._userResponse === this.ACCEPT)
            this._accepted();
        else if (this._userResponse && this._userResponse === this.REJECT)
            this._rejected();
        else
            this._invalid();
    },

    setRecord: function(record, isFlow) {
        if (isFlow)
            this._recordGR = record;
        else {
            // PRB1781438 - Avoid Query BR's
            var recordGr = new GlideRecord(record.getTableName());
            recordGr.setWorkflow(false);
            recordGr.get(record.getUniqueValue());
            this._recordGR = recordGr;
        }
        return this;
    },

    setEmail: function(email) {
        this._email = email;
        this.setCommunicationType(this._escalationUtil.COMMUNICATION_TYPE.EMAIL);
        this.setCommunicationTypeValue(email.origemail);
        return this;
    },

    setUser: function(userSysId) {
        this._userSysId = userSysId;
        return this;
    },

    setCommunicationType: function(commType) {
        this._communicationType = commType;
        return this;
    },

    setCommunicationTypeValue: function(commTypeValue) {
        this._commTypeValue = commTypeValue;
        return this;
    },

    setIsSubflow: function(isSubflow) {
        this._isSubflow = isSubflow;
        return this;
    },

    setUserResponse: function(userResponse) {
        if (this._onCallWorkflowUtils.EMAIL_CHANNEL_ACCEPT_RESPONSES.includes(userResponse))
            this._userResponse = this.ACCEPT;
        else if (userResponse === this._escalationUtil.COMMUNICATION_RESPONSE.ACCEPTED)
            this._userResponse = this.ACCEPT;
        else if (this._onCallWorkflowUtils.EMAIL_CHANNEL_REJECT_RESPONSES.includes(userResponse))
            this._userResponse = this.REJECT;
        else if (userResponse === this._escalationUtil.COMMUNICATION_RESPONSE.REJECTED)
            this._userResponse = this.REJECT;
        else
            this._userResponse = null;

        return this;
    },

    setPushResponse: function(pushResponse) {
        this._pushResponse = pushResponse;
        return this;
    },

    _accepted: function() {

        var tablename = this._recordGR.getRecordClassName();
        var sysId = this._recordGR.getUniqueValue();

        if (this._log.atLevel(GSLog.DEBUG))
            this._log.logDebug('[_accepted] tablename: ' + tablename + ' sysId: ' + sysId + ' userField: ' + this._userField + ' userId: ' + this._userSysId);
        this._onCallWorkflowUtils.updateEscalationResponse(
            this._userSysId,
            tablename,
            sysId,
            this._escalationUtil.COMMUNICATION_RESPONSE.ACCEPTED
        );

        this._setCommunicationResponse(
            tablename,
            sysId,
            this._escalationUtil.COMMUNICATION_RESPONSE.ACCEPTED
        );

        /**
         * setWorkflow(false) will disables the running of business rules and script engines. inserts and updates are not audited
         *
         * Use setUseEngines(false) to disable running the BR and script engines and auditing enabled on the record.
         */
        var taskGr = new GlideRecord(tablename);
        if (taskGr.get(sysId)) {
            var currentUserID = gs.getUser().getID();
            gs.getSession().impersonate(this.SYSTEM);

            taskGr.setValue(this._userField, this._userSysId);
            taskGr.setUseEngines(false);
            taskGr.update();

            gs.getSession().impersonate(currentUserID);
        } else {
            gs.error("Failed to assign the task. Record not found in table: " + tablename + "with sysId: " + sysId);
        }

        var isWorkflowRunning = this._resumeWorkflowContext();

        if (!isWorkflowRunning) {
            var gr = new GlideRecord("sys_user");
            if (gr.get(this._userSysId)) {
                var task = new GlideRecord(tablename);
                task.get(sysId);

                var currentUserId = gs.getUser().getID();
                gs.getSession().impersonate(this.SYSTEM);

                task.work_notes = gs.getMessage("{0} acknowledged", [gr.getDisplayValue()]);
                task.update();

                gs.getSession().impersonate(currentUserId);
            }
        }

        if (new OnCallWorkflowUtils().isMobilePushInstalled()) {
            if (this._pushResponse && this._pushResponse.acceptor && this._pushResponse.acceptor.getValue() === this._userSysId) {
                this._pushResponse.comments = gs.getMessage('User: {0} {1} assignment on record: {2}', [
                    this._pushResponse.acceptor.getDisplayValue(),
                    this._pushResponse.state.getDisplayValue(),
                    this._recordGR.getDisplayValue()
                ]);
            }

            // Cleanup other mobile push notifications
            new OnCallPushRequest().expireMobileNotifications(
                this._userSysId,
                tablename,
                sysId
            );
        }
    },

    _rejected: function() {
        var tablename = this._recordGR.getRecordClassName();
        var sysId = this._recordGR.getUniqueValue();

        if (this._log.atLevel(GSLog.DEBUG))
            this._log.logDebug('[_rejected] tablename: ' + tablename + ' sysId: ' + sysId + ' userField: ' + this._userField + ' userId: ' + this._userSysId);

        this._onCallWorkflowUtils.updateEscalationResponse(
            this._userSysId,
            tablename,
            sysId,
            this._escalationUtil.COMMUNICATION_RESPONSE.REJECTED
        );

        var wfContextsResponse = this._onCallWorkflowUtils.getWFContextsWithRejectedEscalation(
            this._userSysId,
            tablename,
            sysId
        );

        var triggerRuleWfCxtGr = new GlideRecord(this.TRIGGER_RULE_WF_CONTEXT);
        triggerRuleWfCxtGr.addQuery(this.DOCUMENT_TABLE, tablename);
        triggerRuleWfCxtGr.addQuery(this.DOCUMENT, sysId);
        triggerRuleWfCxtGr.orderByDesc(this.SYS_CREATED_ON);
        triggerRuleWfCxtGr.setLimit(1);
        triggerRuleWfCxtGr.query();

        var parentSubflowContextId = null;
        if (triggerRuleWfCxtGr.next()) {
            parentSubflowContextId = triggerRuleWfCxtGr.getValue(this.SUBFLOW_CONTEXT);
        }

        var subflowContextGr = new GlideRecord(this.SYS_FLOW_CONTEXT);
        subflowContextGr.addQuery('source_record', parentSubflowContextId);
        subflowContextGr.addEncodedQuery('stateNOT IN' + this.FLOW_CONTEXT_INACTIVE_STATES.join(","));
        subflowContextGr.query();

        for (var wfContextId in wfContextsResponse) {
            if (wfContextsResponse[wfContextId] == true) {
                while (subflowContextGr.next()) {
                    var subflowContextSysId = subflowContextGr.getUniqueValue();
                    var catchAllContextGr = new GlideRecord(this.SYS_FLOW_CONTEXT);
                    catchAllContextGr.addQuery('source_record', subflowContextSysId);
                    catchAllContextGr.addEncodedQuery('stateNOT IN' + this.FLOW_CONTEXT_INACTIVE_STATES.join(","));
                    catchAllContextGr.query();
                    while (catchAllContextGr.next()) {
                        var catchAllContextSysId = catchAllContextGr.getUniqueValue();
                        this._resumeSubflow(catchAllContextSysId, 'Resume catch all');
                    }
                }
                try {
                    sn_fd.FlowAPI.sendMessage(wfContextId, 'Resume per rota', 'Resume per rota');
                } catch (err) {
                    gs.error("No Flow context found with the sys_id " + wfContextId + " Error - " + JSON.stringify(err));
                }
                new global.Workflow().broadcastEvent(wfContextId, this.RESUME);
            }
        }

        this._setCommunicationResponse(
            tablename,
            sysId,
            this._escalationUtil.COMMUNICATION_RESPONSE.REJECTED
        );

        if (new OnCallWorkflowUtils().isMobilePushInstalled() && this._pushResponse && this._pushResponse.acceptor && this._pushResponse.acceptor.getValue() === this._userSysId) {
            this._pushResponse.comments = gs.getMessage('User: {0} {1} assignment on record: {2}', [
                this._pushResponse.acceptor.getDisplayValue(),
                this._pushResponse.state.getDisplayValue(),
                this._recordGR.getDisplayValue()
            ]);
        }
    },

    _setCommunicationResponse: function(tablename, sysId, response) {
        if (this._communicationType && this._commTypeValue) {
            this._escalationUtil.setCommunicationResponse(
                tablename,
                sysId,
                this._communicationType,
                this._commTypeValue,
                response
            );
        }
    },

    _invalid: function() {
        var tablename = this._recordGR.getRecordClassName();
        var sysId = this._recordGR.getUniqueValue();

        if (this._log.atLevel(GSLog.DEBUG))
            this._log.logDebug('[_invalid] tablename: ' + tablename + ' sysId: ' + sysId + ' userField: ' + this._userField + ' userId: ' + this._userSysId);

        this._onCallWorkflowUtils.updateEscalationResponse(
            this._userSysId,
            tablename,
            sysId,
            this._escalationUtil.COMMUNICATION_RESPONSE.INVALID_RESPONSE
        );

        this._setCommunicationResponse(
            tablename,
            sysId,
            this._escalationUtil.COMMUNICATION_RESPONSE.INVALID_RESPONSE
        );

        if (this._pushResponse) {
            this._pushResponse.comments = gs.getMessage('User: {0} gave invalid response to assignment of record: {1}', [
                this._pushResponse.acceptor.getDisplayValue(),
                this._recordGR.getDisplayValue()
            ]);
        }
    },

    _getMatchingUser: function(emailAddress) {
        var emailDevice = new GlideRecord('cmn_notif_device');
        emailDevice.addQuery('email_address', emailAddress);
        emailDevice.query();
        while (emailDevice.next())
            if (emailDevice.user)
                return emailDevice.user;

        var csGr = new GlideRecord('sys_on_call_contact_source');
        csGr.addQuery('source_type', 'email');
        csGr.addQuery('active', true);
        csGr.query();
        while (csGr.next()) {
            var gr = new GlideRecord(csGr.table + '');
            gr.addQuery(csGr.email_source, emailAddress);
            gr.query();
            if (gr.next()) {
                if (csGr.table == 'sys_user')
                    return gr.getUniqueValue();
                else
                    return gr.getValue(csGr.user_field);
            }
        }
    },

    _hasValidGrpUserFields: function() {
        this._groupField = this.ASSIGNMENT_GROUP;
        this._userField = this.ASSIGNED_TO;

        if (!this._recordGR || !this._recordGR.isValidRecord())
            return false;

        var table = this._recordGR.getRecordClassName();
        if (typeof TriggerRuleTableConfigUtil !== 'undefined') {
            var triggerRuleTableGR = new TriggerRuleTableConfigUtil().getTriggerRuleTableConfigRecord(table);
            if (triggerRuleTableGR) {
                this._groupField = triggerRuleTableGR.getValue(this.TRIGGER_GROUP_FIELD);
                this._userField = triggerRuleTableGR.getValue(this.TRIGGER_USER_FIELD);
            }
        }

        if (!this._recordGR.isValidField(this._groupField) || !this._recordGR.isValidField(this._userField)) {
            if (this._log.atLevel(GSLog.DEBUG))
                this._log.logDebug('[process] group or user field not valid for table: ' + table);

            return false;
        }

        return true;
    },

    _resumeWorkflowContext: function() {
        var isWorkflowRunning = false;
        if (!this._recordGR)
            return;

        var documentTable = this._recordGR.getRecordClassName();
        var documentId = this._recordGR.getUniqueValue();
        var userId = this._userSysId;
        if (!documentTable || !documentId || !userId)
            return;
        var documentGr = new GlideRecord(documentTable);
        var triggerRuleWfCxtGr = new GlideRecord(this.TRIGGER_RULE_WF_CONTEXT);
        triggerRuleWfCxtGr.addQuery(this.DOCUMENT_TABLE, documentTable);
        triggerRuleWfCxtGr.addQuery(this.DOCUMENT, documentId);
        triggerRuleWfCxtGr.orderByDesc(this.SYS_CREATED_ON);
        triggerRuleWfCxtGr.setLimit(1);
        triggerRuleWfCxtGr.query();

        var parentWfContextSysId = null;
        var parentSubflowContextId = null;
        var parentPerRotaContextId = null;
        if (triggerRuleWfCxtGr.next()) {
            parentWfContextSysId = triggerRuleWfCxtGr.getValue(this.WF_CONTEXT);
            parentSubflowContextId = triggerRuleWfCxtGr.getValue(this.SUBFLOW_CONTEXT);
        }

        var groupWfCxtGr = new GlideRecord(this.TRIGGER_RULE_WF_CONTEXT);
        groupWfCxtGr.addQuery(this.DOCUMENT_TABLE, documentTable);
        groupWfCxtGr.addQuery(this.DOCUMENT, documentId);
        groupWfCxtGr.addNotNullQuery(this.PARENT_SUBFLOW_CONTEXT);
        groupWfCxtGr.setLimit(1);
        groupWfCxtGr.query();

        if (groupWfCxtGr.next()) {
            parentPerRotaContextId = groupWfCxtGr.getValue(this.PARENT_SUBFLOW_CONTEXT);
        }

        if (parentWfContextSysId) {
            var wfContextGr = new GlideRecord(this.WF_CONTEXT);
            wfContextGr.addQuery(this.PARENT, parentWfContextSysId);
            wfContextGr.query();
            while (wfContextGr.next()) {
                var wfContextSysId = wfContextGr.getUniqueValue();
                if (wfContextGr.active) isWorkflowRunning = true;

                if (this._log.atLevel(GSLog.DEBUG))
                    this._log.logDebug('[_resumeWorkflowContext] resume wf_context.sys_Id: ' + wfContextSysId);

                new global.Workflow().broadcastEvent(wfContextSysId, this.RESUME);
            }
        } else if (parentSubflowContextId) {
            var subflowContextGr = new GlideRecord(this.SYS_FLOW_CONTEXT);
            subflowContextGr.addQuery('source_record', parentSubflowContextId);
            subflowContextGr.addEncodedQuery('stateNOT IN' + this.FLOW_CONTEXT_INACTIVE_STATES.join(","));
            subflowContextGr.query();
            while (subflowContextGr.next()) {
                isWorkflowRunning = true;
                var subflowContextSysId = subflowContextGr.getUniqueValue();
                var catchAllContextGr = new GlideRecord(this.SYS_FLOW_CONTEXT);
                catchAllContextGr.addQuery('source_record', subflowContextSysId);
                catchAllContextGr.addEncodedQuery('stateNOT IN' + this.FLOW_CONTEXT_INACTIVE_STATES.join(","));
                catchAllContextGr.query();
                while (catchAllContextGr.next()) {
                    var catchAllContextSysId = catchAllContextGr.getUniqueValue();
                    this._resumeSubflow(catchAllContextSysId, 'Resume catch all');
                }
                this._resumeSubflow(subflowContextSysId, 'Resume per rota');
                if (parentPerRotaContextId)
                    this._resumeSubflow(parentPerRotaContextId, 'Resume per rota'); //Resume parent per rota if current is group escalation
            }
        } else { //Fallback if not triggerred from trigger rules
            var wfContextIds = [];
            var flowContextIds = [];
            var onCallEscalationResponseGr = new GlideRecord(this.ON_CALL_ESCALATION_RESPONSE);
            onCallEscalationResponseGr.addQuery('table', documentTable);
            onCallEscalationResponseGr.addQuery('source', documentId);
            onCallEscalationResponseGr.addQuery('user', userId);
            onCallEscalationResponseGr.query();
            while (onCallEscalationResponseGr.next()) {
                if (onCallEscalationResponseGr.wf_context)
                    wfContextIds.push(onCallEscalationResponseGr.wf_context + '');
                if (onCallEscalationResponseGr.subflow_context)
                    flowContextIds.push(onCallEscalationResponseGr.subflow_context + '');
            }
            if (wfContextIds.length > 0) {
                var workflowContextGr = new GlideRecord(this.WF_CONTEXT);
                workflowContextGr.addQuery('sys_id', 'IN', wfContextIds);
                workflowContextGr.query();
                while (workflowContextGr.next()) {
                    var workflowContextSysId = workflowContextGr.getUniqueValue();
                    if (workflowContextGr.active) isWorkflowRunning = true;

                    if (this._log.atLevel(GSLog.DEBUG))
                        this._log.logDebug('[_resumeWorkflowContext] Resuming wf_context.sys_Id: ' + workflowContextSysId);

                    new global.Workflow().broadcastEvent(workflowContextSysId, this.RESUME);
                }
            } else if (flowContextIds.length > 0 && this._isSubflow) {
                if (documentGr.get(documentId)) {
                    var flowContextGr = sn_fd.FlowAPI.getRunningFlows(documentGr);
                    if (flowContextGr.hasNext())
                        isWorkflowRunning = true;
                }
                flowContextIds.forEach(function(flowContextId) {
                    this._resumeSubflow(flowContextId, 'Resume per rota');
                });
            }
        }
        return isWorkflowRunning;
    },

    _resumeSubflow: function(contextId, message) {
        try {
            if (this._log.atLevel(GSLog.DEBUG))
                this._log.logDebug('[_resumeWorkflowContext] resume subflow_context.sys_Id: ' + contextId);
            sn_fd.FlowAPI.sendMessage(contextId, message, message);
        } catch (ex) {
            var message = ex.getMessage();
            if (this._log.atLevel(GSLog.ERROR))
                this._log.logError(message);
        }
    },

    _hasValidUserAndRecord: function() {

        // Validate User
        this._userSysId = this._userSysId ? this._userSysId : gs.getUserID();
        if (!this._userSysId) {

            if (this._log.atLevel(GSLog.DEBUG))
                this._log.logDebug('[_hasValidUserAndRecord] user is invalid');

            return false;
        }

        if (this._email && gs.getUser().getUserByID(this._userSysId).isDefault()) {
            var matchingUserId = this._getMatchingUser(this._email.origemail);
            if (matchingUserId)
                this._userSysId = matchingUserId;
        } else if (new OnCallWorkflowUtils().isMobilePushInstalled() && this._pushResponse && this._pushResponse.acceptor && this._pushResponse.acceptor.getValue() === this._userSysId)
            this._userSysId = this._pushResponse.acceptor.getValue();

        var isValidUser = !!gs.getUser().getUserByID(this._userSysId);
        if (!isValidUser) {

            if (this._log.atLevel(GSLog.DEBUG))
                this._log.logDebug('[_hasValidUserAndRecord] user is invalid');

            return false;
        }

        // Validate Record
        if (!this._hasValidGrpUserFields()) {

            if (this._log.atLevel(GSLog.ERROR))
                this._log.logError('[_hasValidUserAndRecord] record does not have valid user group in trigger_rule_table_cfg');

            return false;
        }

        // Validate record is not already assigned to a user
        if (this._recordGR.getValue(this._userField)) {

            if (this._log.atLevel(GSLog.DEBUG))
                this._log.logDebug('[_hasValidUserAndRecord] record: [' + this._recordGR + '] is already assigned to a user');

            return false;
        }

        if (this._userResponse && this._userResponse === this.ACCEPT) {
            var recordAccessible = this.isRecordAccessibleToUser();
            if (!recordAccessible) {
                if (this._log.atLevel(GSLog.DEBUG))
                    this._log.logDebug('[_hasValidUserAndRecord] record: [' + this._recordGR + '] cannot be read by user: ' + this._userSysId);
                return false;
            }
        }

        return true;
    },

    isRecordAccessibleToUser: function() {
        if (!this._accessCache) {
            this._accessCache = {};
        }
        if (typeof this._accessCache[this._userSysId + "_" + this._recordGR.getUniqueValue()] === 'undefined')
            this._accessCache[this._userSysId + "_" + this._recordGR.getUniqueValue()] = new global.OnCallCommon().isRecordAccessibleToUser(this._userSysId, this._recordGR);
        return this._accessCache[this._userSysId + "_" + this._recordGR.getUniqueValue()];
    },

    type: 'OnCallAssignByAckSNC',
};
