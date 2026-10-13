var NotifyWorkflow = Class.create();
NotifyWorkflow.prototype = {

    NOTIFY_STATUS_TO_EVENT_NAME_MAP: {
        'ringing': 'ringing',
        'in_progress': 'InProgress',
        'completed': 'completed',
        'no_answer': 'NoAnswer',
        'busy': 'busy',
        'failed': 'failed',
        'invalid': 'invalid',
        'initiated': 'initiated',
        'input': '-noevent-'
    },

    NUM_TRIES: gs.getProperty('com.snc.notify.wf_activity_max_tries', 20),

    initialize: function() {
        this.workflowScriptAPI = new SNC.WorkflowScriptAPI();
        this.db = new NotifyDatabase();
        this.flow = new NotifyFlow();
        this.flowUtil = new NotifyFlowUtil();
    },

    runIncomingCallWorkflow: function( /*String*/ notifyPhoneNumber, /*GlideRecord*/ callRecord) {
        var notifyPhoneNumberGroupRecord = this.db.getNotifyPhoneNumberGroupRecord(notifyPhoneNumber);
        var notifyAction = null;
        if (this._isSubflowExecutionEnabled(notifyPhoneNumberGroupRecord)) {
            notifyAction = this.flow.runIncomingCallSubflow(notifyPhoneNumber, callRecord, notifyPhoneNumberGroupRecord);
        } else {
            notifyAction = this._runWorkflow(notifyPhoneNumber, "incoming_call_workflow", callRecord, notifyPhoneNumberGroupRecord);
        }
        notifyAction.setCallRecord(callRecord);
        return notifyAction;
    },

    runIncomingCallWorkflowJ: function( /*String*/ notifyPhoneNumber, /*GlideRecord*/ callRecord) {
        return this._getNotifyActionJson(this.runIncomingCallWorkflow(notifyPhoneNumber, callRecord));
    },

    runOutgoingCallWorkflow: function( /*String*/ notifyPhoneNumber, /*GlideRecord*/ callRecord, /*GlideRecord*/ conferenceCallRecord) {
        var notifyPhoneNumberGroupRecord = this.db.getNotifyPhoneNumberGroupRecord(notifyPhoneNumber);
        if (this._isSubflowExecutionEnabled(notifyPhoneNumberGroupRecord)) {
            this.flow.runOutgoingCallSubflow(notifyPhoneNumber, callRecord, conferenceCallRecord, notifyPhoneNumberGroupRecord);
        } else {
            this.startWorkflow(notifyPhoneNumber, "outgoing_call_workflow", callRecord, conferenceCallRecord, notifyPhoneNumberGroupRecord);
        }
    },

    runIncomingSMSWorkflow: function( /*String*/ notifyPhoneNumber, /*GlideRecord*/ messageRecord) {
        var notifyNumberGr = new GlideRecord("notify_number");
        notifyNumberGr.addQuery("number", notifyPhoneNumber);
        notifyNumberGr.addActiveQuery();
        notifyNumberGr.query();
        var isOptMessage = false;
        if (notifyNumberGr.next()) {
            var owner = notifyNumberGr.getValue('owner');
            var numberType = notifyNumberGr.getValue('short_code') === null ? 'long' : 'short';
            var handler = new sn_sms_pref.SMSPreferenceHandler(owner);
            isOptMessage = handler.isOptMessage(messageRecord.getValue('body'), numberType);
        }

        if (isOptMessage) return;
        var notifyPhoneNumberGroupRecord = this.db.getNotifyPhoneNumberGroupRecord(notifyPhoneNumber);
        if (this._isSubflowExecutionEnabled(notifyPhoneNumberGroupRecord)) {
            this.flow.runIncomingSMSSubflow(notifyPhoneNumber, messageRecord, notifyPhoneNumberGroupRecord);
        } else {
            this._runWorkflow(notifyPhoneNumber, "incoming_sms_workflow", messageRecord, notifyPhoneNumberGroupRecord);
        }
    },

    runOutgoingSMSWorkflow: function( /*String*/ notifyPhoneNumber, /*GlideRecord*/ messageRecord) {
        var notifyPhoneNumberGroupRecord = this.db.getNotifyPhoneNumberGroupRecord(notifyPhoneNumber);
        if (this._isSubflowExecutionEnabled(notifyPhoneNumberGroupRecord)) {
            this.flow.runOutgoingSMSSubflow(notifyPhoneNumber, messageRecord, notifyPhoneNumberGroupRecord);
        } else {
            this._runWorkflow(notifyPhoneNumber, "outgoing_sms_workflow", messageRecord, notifyPhoneNumberGroupRecord, true);
        }
    },

    workflowIsRunning: function( /*GlideRecord*/ someRecord) {
        var context = this.workflowScriptAPI.getContexts(someRecord);
        return (context && context.next());
    },

    _runWorkflow: function( /*String*/ notifyPhoneNumber, /*String*/ workflowColumn, /*GlideRecord*/ callOrMessageRecord, /*GlideRecord*/ notifyPhoneNumberGroupRecord, suppressErrorLog) {
        var workflow = notifyPhoneNumberGroupRecord.getElement(workflowColumn);

        // check if workflow is defined and that a context does not already exist for this call
        if (!workflow.nil()) {
            if (!this.workflowIsRunning(callOrMessageRecord)) {

                // start workflow
                this.workflowScriptAPI.startFlow(workflow.getValue(), callOrMessageRecord, null, null);

                // process activities
                return this.flowUtil.processExecutingWorkflowActivities(callOrMessageRecord);
            }
        } else if (!suppressErrorLog) {
            // add error log
            gs.error("There is no workflow associated in workflow column " + workflowColumn + " of Notify Group " + notifyPhoneNumberGroupRecord.getValue("name"));
        }

        return new SNC.NotifyAction();
    },

    startWorkflow: function( /*String*/ notifyPhoneNumber, /*String*/ workflowColumn, /*GlideRecord*/ callOrMessageRecord, /*GlideRecord*/ conferenceCallRecord, /*GlideRecord*/ notifyPhoneNumberGroupRecord) {
        var workflow = notifyPhoneNumberGroupRecord.getElement(workflowColumn);

        // check if workflow is defined and that a context does not already exist for this call
        if (!workflow.nil()) {
            // start workflow if its not already running
            if (!this.workflowIsRunning(callOrMessageRecord)) {
                var scratchMap = null;

                // add conference call to the scratchpad if needed
                if (conferenceCallRecord != null) {
                    scratchMap = {
                        conference_call: conferenceCallRecord
                    };
                }

                this.workflowScriptAPI.startFlow(workflow.getValue(), callOrMessageRecord, null, scratchMap);
            }
        } else {
            // add error log
            gs.error("There is no workflow associated in workflow column " + workflowColumn + " of Notify Group " + notifyPhoneNumberGroupRecord.getValue("name"));
        }
    },

    finishWaitingActivities: function( /*String*/ notifyNumber, /*GlideRecord*/ callOrMessageRecord, /*Object - Optional*/ jsonArgs, /*boolean - Optional*/ getNext,
        /*String - Optional*/
        actionSysId) {
        // get all the records from notify_wf_activity for this call that are state = processed
        var notifyWFActivity = new GlideRecord("notify_wf_activity");
        notifyWFActivity.addQuery("notify_call", callOrMessageRecord.getUniqueValue());
        notifyWFActivity.addQuery("state", "processed");
        notifyWFActivity.orderByDesc("sys_created_on");
        notifyWFActivity.query();

        var json = {};
        var fromNumber = callOrMessageRecord.getValue("phone_number");

        json.notify_number = notifyNumber;
        json.from_number = fromNumber;

        // add extra arguments?
        if (jsonArgs) {
            for (var k in jsonArgs) {
                json[k] = jsonArgs[k];
            }
        }

        // set state to complete
        while (notifyWFActivity.next()) {
            notifyWFActivity.setValue("state", "complete");
            notifyWFActivity.setValue("response_args", JSON.stringify(json));
            notifyWFActivity.update();

            // update the call record with the last completed action
            callOrMessageRecord.setValue("last_action", notifyWFActivity.getValue("notify_action"));
            callOrMessageRecord.setForceUpdate(true);
            callOrMessageRecord.update();
        }

        // get the next batch of activities that are ready to be executed
        if (getNext) {
            var notifyAction = new SNC.NotifyAction();
            if (actionSysId) {
                var action = this.db.popActionJson(actionSysId);
                if (action)
                    notifyAction.fromJson(action);
            }
            notifyAction.append(this.flowUtil.processExecutingWorkflowActivities(callOrMessageRecord));
            // set call record
            notifyAction.setCallRecord(callOrMessageRecord);

            return notifyAction;
        }
    },

    finishWaitingActivitiesJ: function( /*String*/ notifyNumber, /*GlideRecord*/ callOrMessageRecord, /*Object - Optional*/ jsonArgs, /*boolean - Optional*/ getNext,
        /*String - Optional*/
        actionSysId) {
        return this._getNotifyActionJson(this.finishWaitingActivities(notifyNumber, callOrMessageRecord, jsonArgs, getNext, actionSysId));
    },

    broadcastEvent: function( /*String*/ callId, /*String*/ notifyStatus) {
        var call = new GlideRecord("notify_call");

        if (call.get("call_id", callId)) {
            var eventName = this._notifyStatusToEventName(notifyStatus);
            if (eventName)
                this._broadcastEvent(call, eventName);
        }
    },

    _notifyStatusToEventName: function(notifyStatus) {
        if (notifyStatus && this.db.VALID_CALL_STATUS.indexOf(notifyStatus) > -1) {

            var eventName = this.NOTIFY_STATUS_TO_EVENT_NAME_MAP[notifyStatus];
            if (eventName && eventName === '-noevent-')
                return;
            if (eventName)
                return eventName;
            else
                gs.error('The given notify status - ' + notifyStatus + ', cannot raise an event.');
        } else
            gs.error('Bad notify status "' + notifyStatus + '" provided.');
    },

    _broadcastEvent: function( /*GlideRecord*/ call, /*String*/ eventName) {
        var context = this._getWorkflowContext(call);
        while (context.next())
            this.workflowScriptAPI.broadcastEvent(context.getUniqueValue(), eventName, null);
    },

    _getWorkflowContext: function( /*GlideRecord*/ callRecord) {
        var workflowContext = new GlideRecord("wf_context");
        workflowContext.addQuery("id", callRecord.getUniqueValue());
        workflowContext.addQuery("table", "notify_call");
        workflowContext.query();

        if (workflowContext.hasNext() && workflowContext.isValid())
            return workflowContext;
    },

    processExecutingActivity: function( /*GlideRecord*/ callOrMessageRecord) {
        return this.flowUtil.processExecutingWorkflowActivities(callOrMessageRecord);
    },

    processExecutingActivityJ: function( /*GlideRecord*/ callOrMessageRecord) {
        return this._getNotifyActionJson(this.processExecutingActivity(callOrMessageRecord));
    },

    processAndWaitActivityJ: function(callOrMessageRecord) {
        var action;
        var callSysID = callOrMessageRecord.getUniqueValue();
        var executingAct = this.flowUtil.getExecutingActivity(callSysID);
        var numTries = 0;
        while (!executingAct.hasNext() && numTries < this.NUM_TRIES) {
            gs.sleep(this.flowUtil.ACTIVITY_WAIT_TIME);
            executingAct = this.flowUtil.getExecutingActivity(callSysID);
            numTries++;
        }
        action = this.processExecutingActivity(callOrMessageRecord);
        return this._getNotifyActionJson(action);
    },

    _getNotifyActionJson: function( /*SNC.NotifyAction*/ action) {
        if (action) {
            var j = action.toJson();
            gs.debug("NotifyAction JSON: " + j);
            return JSON.parse(j);
        }
    },

    _isSubflowExecutionEnabled: function( /*GlideRecord*/ notifyPhoneNumberGroupRecord) {
        if (!notifyPhoneNumberGroupRecord.isValidField("execute_using_subflow") || notifyPhoneNumberGroupRecord.getValue("execute_using_subflow") === "1") {
            return true;
        }
        return false;
    },

    type: 'NotifyWorkflow'
};
