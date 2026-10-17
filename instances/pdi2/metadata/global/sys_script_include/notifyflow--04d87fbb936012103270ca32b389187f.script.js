var NotifyFlow = Class.create();
NotifyFlow.prototype = {
    initialize: function() {
        this.flowUtil = new NotifyFlowUtil();
    },

    runIncomingCallSubflow: function( /*String*/ notifyPhoneNumber, /*GlideRecord*/ callRecord, /*GlideRecord*/ notifyPhoneNumberGroupRecord) {
        var notifyAction = this._runSubflow(notifyPhoneNumber, "incoming_call_subflow", callRecord, notifyPhoneNumberGroupRecord);
        notifyAction.setCallRecord(callRecord);
        return notifyAction;
    },

    runOutgoingCallSubflow: function( /*String*/ notifyPhoneNumber, /*GlideRecord*/ callRecord, /*GlideRecord*/ conferenceCallRecord, /*GlideRecord*/ notifyPhoneNumberGroupRecord) {
        this._startSubflow(notifyPhoneNumber, "outgoing_call_subflow", callRecord, conferenceCallRecord, notifyPhoneNumberGroupRecord);
    },

    runIncomingSMSSubflow: function( /*String*/ notifyPhoneNumber, /*GlideRecord*/ messageRecord, /*GlideRecord*/ notifyPhoneNumberGroupRecord) {
        this._runSubflow(notifyPhoneNumber, "incoming_sms_subflow", messageRecord, notifyPhoneNumberGroupRecord);
    },

    runOutgoingSMSSubflow: function( /*String*/ notifyPhoneNumber, /*GlideRecord*/ messageRecord, /*GlideRecord*/ notifyPhoneNumberGroupRecord) {
        this._runSubflow(notifyPhoneNumber, "outgoing_sms_subflow", messageRecord, notifyPhoneNumberGroupRecord, true);
    },

    _runSubflow: function( /*String*/ notifyPhoneNumber, /*String*/ subflowColumn, /*GlideRecord*/ callOrMessageRecord, /*GlideRecord*/ notifyPhoneNumberGroupRecord, suppressErrorLog) {
        var subflow = notifyPhoneNumberGroupRecord.getElement(subflowColumn);

        // check if subflow is defined and that a context does not already exist for this call
        if (!subflow.nil()) {
            if (!this._subflowIsRunning(callOrMessageRecord)) {
                try {
                    var inputs = {};
                    if (callOrMessageRecord != null && callOrMessageRecord.isValidRecord()) {
                        var tableName = callOrMessageRecord.getTableName(); // notify_call or notify_message
                        inputs[tableName] = callOrMessageRecord;
                    }
                    sn_fd.FlowAPI.getRunner()
                        .subflow(subflow.getRefRecord().getValue("internal_name"))
                        .inForeground()
                        .withInputs(inputs)
                        .run();
                } catch (err) {
                    gs.error(err.getMessage());
                } finally {
                    var contextId = this._getContextFromCallorMsgRecord(callOrMessageRecord, subflow);
                    if (contextId) {
                        callOrMessageRecord.setValue("sys_flow_context", contextId);
                        callOrMessageRecord.update();
                    }
                }
                // process activities
                return this.flowUtil.processExecutingWorkflowActivities(callOrMessageRecord);
            }
        } else if (!suppressErrorLog) {
            // add error log
            gs.error("There is no subflow associated in subflow column " + subflowColumn + " of Notify Group " + notifyPhoneNumberGroupRecord.getValue("name"));
        }

        return new SNC.NotifyAction();
    },

    _startSubflow: function( /*String*/ notifyPhoneNumber, /*String*/ subflowColumn, /*GlideRecord*/ callOrMessageRecord, /*GlideRecord*/ conferenceCallRecord, /*GlideRecord*/ notifyPhoneNumberGroupRecord) {
        var subflow = notifyPhoneNumberGroupRecord.getElement(subflowColumn);

        // check if subflow is defined and that a context does not already exist for this call
        if (!subflow.nil()) {
            if (!this._subflowIsRunning(callOrMessageRecord)) {
                try {
                    var inputs = {};
                    if (callOrMessageRecord != null && callOrMessageRecord.isValidRecord()) {
                        var tableName = callOrMessageRecord.getTableName(); // notify_call or notify_message
                        inputs[tableName] = callOrMessageRecord;
                    }

                    if (conferenceCallRecord != null && conferenceCallRecord.isValidRecord())
                        inputs['notify_conference_call'] = conferenceCallRecord;

                    sn_fd.FlowAPI.getRunner()
                        .subflow(subflow.getRefRecord().getValue("internal_name"))
                        .inForeground()
                        .withInputs(inputs)
                        .run();

                } catch (err) {
                    gs.error(err.getMessage());

                } finally {
                    var contextId = this._getContextFromCallorMsgRecord(callOrMessageRecord, subflow);
                    if (contextId) {
                        callOrMessageRecord.setValue("sys_flow_context", contextId);
                        callOrMessageRecord.update();
                    }
                }
            }
        } else {
            // add error log
            gs.error("There is no subflow associated in subflow column " + subflowColumn + " of Notify Group " + notifyPhoneNumberGroupRecord.getValue("name"));
        }
    },

    _getContextFromCallorMsgRecord: function( /*GlideRecord*/ callOrMessageRecord, /*GlideElement*/ subflow) {
        var flowValueGR = new GlideRecord("sys_flow_value");
        flowValueGR.addEncodedQuery("valueLIKE" + callOrMessageRecord.getUniqueValue());
        flowValueGR.addEncodedQuery("context.flow=" + subflow.getRefRecord().getUniqueValue());
        flowValueGR.setLimit(1);
        flowValueGR.query();
        if (flowValueGR.next()) {
            return flowValueGR.getValue("context");
        }
        return null;
    },

    _subflowIsRunning: function( /*GlideRecord*/ callOrMessageRecord, /*GlideElement*/ subflow) {
        if (!callOrMessageRecord || !callOrMessageRecord.isValidRecord())
            return false;

        return !!callOrMessageRecord.sys_flow_context;
    },

    type: 'NotifyFlow'
};
