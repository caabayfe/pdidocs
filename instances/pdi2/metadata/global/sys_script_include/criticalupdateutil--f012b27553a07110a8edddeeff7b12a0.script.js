var CriticalUpdateUtil = Class.create();
CriticalUpdateUtil.prototype = {
    initialize: function() {},
    calcPriority: function(gr) {
        var currentdate = new GlideDate();
        var res = '';
        var enddate = new GlideDate();
        enddate.addMonths(6);
        if (gr.up_update_status == 'acknowledged' || gr.up_due_date == '') {
            res = '';
        } else if (currentdate > gr.up_due_date) {
            res = 'overdue';
        } else if (gr.up_due_date < enddate.getDate()) {
            res = 'due_soon';
        } else {
            res = 'not_due_soon';
        }
        return res; // return the calculated value
    },

    updateStepActivity: function(recordId, stepState, stepLabel) {
        if (!this._validUser()) {
            return;
        }
        recordId.state = stepState;
        recordId.update();
        var ca_context = "";
        var gr = new GlideRecord('sys_pd_activity_context');
        gr.addQuery('associated_record', recordId.sys_id);
        gr.query();
        if (gr.next()) {
            ca_context = gr.context;
            var customerActionRecord = "";
            var gr_context = new GlideRecord('sys_pd_context');
            if (gr_context.get(ca_context)) {
                customerActionRecord = gr_context.input_record;
                var grBP = new GlideRecord('sn_critical_update');
                if (grBP.get(customerActionRecord)) {
                    grBP.up_comments = "Step : " + gr.label + "\n State : " + stepLabel;
                    grBP.update();
                }
            }
        }
    },

    getCAStepCount: function(recordId) {
        if (!this._validUser()) {
            return {};
        }
        var completedStepCount = 0;
        var totalSteps = 0;
        var gr = new GlideRecord('sys_pd_context');
        gr.addQuery('input_record', recordId);
        gr.orderByDesc('sys_created_on');
        gr.setLimit(1);
        gr.query();
        if (gr.next()) {
            var contextId = gr.sys_id;
            var grActivityContext = new GlideRecord('sys_pd_activity_context');
            grActivityContext.addQuery('context', contextId);
            grActivityContext.addQuery('activity_type', '!=', '');
            grActivityContext.query();
            totalSteps = grActivityContext.getRowCount();
            while (grActivityContext.next()) {
                var sysFlowId = grActivityContext.associated_record.sys_id;
                if (!sysFlowId) {
                    continue;
                }
                if (sysFlowId) {
                    var state = grActivityContext.associated_record.state;
                    if (state == 'COMPLETE') {
                        completedStepCount++;
                    }
                }
            }
        }

        return {
            'totalSteps': totalSteps,
            'completedSteps': completedStepCount
        };
    },

    completeCustomerActionStep: function(currentRec) {
        if (!this._validUser()) {
            return;
        }
        var currentExecution = "";
        var currentActivity = "";
        currentRec.state = 'COMPLETE';
        currentRec.update();
        var result = "ready_ack";
        var processId = "";
        var activityId = "";
        var gr = new GlideRecord('sys_pd_activity_context');
        gr.addQuery('associated_record', currentRec.sys_id);
        gr.query();
        if (gr.next()) {
            currentExecution = gr.context;
            currentActivity = gr.activity_definition;
            activityId = gr.activity_id;
        }

        //Evaluate critical update status
        var gr_execution = new GlideRecord("sys_pd_activity_context");
        gr_execution.addEncodedQuery("context=" + currentExecution + "^activity_definition=" + currentActivity);
        gr_execution.query();
        while (gr_execution.next()) {
            if (gr_execution.associated_record.state != 'COMPLETE') {
                result = "work_in_progress";
                break;
            }
        }
        //Get sysId of associated update record
        var gr_context = new GlideRecord("sys_pd_context");
        if (gr_context.get(currentExecution)) {
            var updateRecord = gr_context.input_record;
            processId = gr_context.process_definition.source;
        }
        //Update status of update record
        var gr_update = new GlideRecord("sn_critical_update");
        if (gr_update.get(updateRecord)) {
            gr_update.up_update_status = result;
            gr_update.update();
        }

        //update the Admin MFA Acknowledgement property when admin completes the last activity in critical updates section
        if (processId == 'a48a5bfa7ff05210f16f91fadc866556' && activityId == '1f4e0f01f495101f469e01f40b101f4c') {
            GlidePropertiesDB.set('glide.authenticate.multifactor.enforcement.acknowledged', true);
        }

        this.updateStepActivity(currentRec, "COMPLETE", "Complete");
    },

    restartCustomerActionStep: function(currentRec) {
        if (!this._validUser()) {
            return;
        }
        currentRec.state = 'IN_PROGRESS';
        currentRec.update();
        var currentExecution = "";
        var gr = new GlideRecord('sys_pd_activity_context');
        gr.addQuery('associated_record', currentRec.sys_id);
        gr.query();
        if (gr.next()) {
            currentExecution = gr.context;
        }

        //Get sysId of associated update record
        var gr_context = new GlideRecord("sys_pd_context");
        if (gr_context.get(currentExecution))
            var updateRecord = gr_context.input_record;

        //Update status of update record
        var gr_update = new GlideRecord("sn_critical_update");
        if (gr_update.get(updateRecord) && gr_update.up_update_status != 'work_in_progress') {
            gr_update.up_update_status = 'work_in_progress';
            gr_update.update();
        }
        this.updateStepActivity(currentRec, "IN_PROGRESS", "In Progress");
    },
    activateCustomerAction: function() {
        if (!this._validUser()) {
            return;
        }
        var gr = new GlideRecord('sn_critical_update');
        gr.addEncodedQuery('up_active=false'); // Query for inactive updates
        gr.query();
        while (gr.next()) {
            if (gr.up_condition)
                gr.up_active = new GlideScopedEvaluator().evaluateScript(gr, "up_condition");
            else
                gr.up_active = true;
            gr.update();
        }

        // update any critical updates that are open but should be complete or complete but should be open
        this.setCAStatus("open", "COMPLETE", "acknowledged");
        this.setCAStatus("acknowledged", "IN_PROGRESS", "open");
    },

    setCAStatus: function(customerActionStatus, pdContextState, expectedStatus) {
        var grCU = new GlideRecord('sn_critical_update');
        grCU.addQuery('up_update_status', customerActionStatus);
        grCU.addQuery('up_active', true);
        grCU.query();
        while (grCU.next()) {
            var grPC = new GlideRecord('sys_pd_context');
            grPC.addQuery('input_record', grCU.sys_id);
            grPC.orderByDesc('sys_updated_on');
            grPC.query();
            if (!grPC.next()) {
                gs.warn("Failed to find the sys_pd_context for sn_critical_update " + grCU.sys_id);
                continue;
            }
            if (grPC.getValue('state') == pdContextState) {
                grCU.setValue('up_update_status', expectedStatus);
                grCU.update();
            }
        }
    },

    cancelPreviousPBAfterUpgrade: function() {
        if (!this._validUser())
            return;
        var grCA = new GlideRecord('sn_critical_update');
        grCA.addQuery('up_active', true);
        grCA.query();
        while (grCA.next()) {
            var eQuery = "input_record=" + grCA.sys_id + "^state!=CANCELLED";
            var grPD = new GlideRecord('sys_pd_context');
            grPD.addEncodedQuery(eQuery, true);
            grPD.orderByDesc('sys_created_on');
            grPD.query();
            if (grPD.getRowCount() < 2) //no action needed if there are less than two snapshots
                continue;
            grPD.next(); //Skip the latest snapshot
            while (grPD.next()) { //Cancel all previous n-1 snapshots
                this.cancelAndForceCancelPB(grPD, "Steps have been restarted or updated due to upgrade");
            }
        }
    },

    fixIncorrectlyCancelledPB: function() {
        if (!this._validUser())
            return;
        var grCA = new GlideRecord('sn_critical_update');
        grCA.addEncodedQuery('up_update_status!=acknowledged^up_active=true', true);
        grCA.query();
        while (grCA.next()) {
            var grPD = new GlideRecord('sys_pd_context');
            grPD.addEncodedQuery("input_record=" + grCA.sys_id, true);
            grPD.orderByDesc('sys_created_on');
            grPD.query();
            var countPBs = grPD.getRowCount();
            if (countPBs < 2) //no action needed if there are less than two snapshots
                continue;
            if (grPD.next() && grPD.state != 'CANCELLED')
                continue;

            //if any completed PB is found, update the update CA record to acknowledged and exit
            var completedPD = new GlideRecord('sys_pd_context');
            completedPD.addEncodedQuery("input_record=" + grCA.sys_id + "^state=COMPLETE", true);
            completedPD.query();
            if (completedPD.getRowCount() > 0) {
                grCA.up_update_status = 'acknowledged';
                grCA.update();
                continue;
            }

            //cancel all existing PBs and restart the CA
            var defName = grPD.process_definition.name;
            while (grPD.next()) {
                if (grPD.state != 'CANCELLED')
                    this.cancelAndForceCancelPB(grPD, "Steps have been restarted or updated due to upgrade");
            }
            sn_playbook.PlaybookExperience.triggerPlaybook(this.getProcessScope(defName) + '.' + defName, grCA); //Trigger new playbook
        }
    },

    triggerNewPlaybookUponRestart: function(recordId) {
        var gr = new GlideRecord('sys_pd_context');
        gr.addQuery('input_record', recordId);
        gr.orderByDesc('sys_created_on');
        gr.query();
        if (gr.next()) {
	    this.cancelAndForceCancelPB(gr, "Steps have been restarted");

            var grCA = new GlideRecord("sn_critical_update");
            if (grCA.get(recordId) && grCA.getValue('up_update_status') == 'acknowledged') {
                sn_playbook.PlaybookExperience.triggerPlaybook(this.getProcessScope(gr.process_definition.name) + '.' + gr.process_definition.name, grCA); //Trigger new playbook
                grCA.setValue("up_update_status", "open");
                grCA.update();
            }
        }
    },

    cancelAndForceCancelPB: function(playbookId, cancelMessage) {
        var MAX_ATTEMPTS = 5;
        var WAIT_MS = 1000; //1 second
        var WAIT_FOR_STATE = 'PENDING_CANCEL';

        //Initiate cancellation
        try {
            sn_playbook.PlaybookExperience.cancelPlaybook(playbookId, cancelMessage);
        } catch (exCancel) {
            gs.warn("PlaybookCancellationHandler: Error during cancelPlaybook, " + exCancel.message);
            return;
        }

        //Wait for state to change to Pending
        var attempt = 0;
        while (attempt < MAX_ATTEMPTS) {
            var state = playbookId.getValue('state');
            if (state === WAIT_FOR_STATE) {
                try {
                    sn_playbook.PlaybookExperience.cancelPlaybook(playbookId, "", "", true); //Force cancel
                    return;
                } catch (exForceCancel) {
                    gs.warn("PlaybookCancellationHandler: Error during forcecancelPlaybook, " + exForceCancel.message);
                    return;
                }
            }
            attempt++;
            try {
                gs.sleep(WAIT_MS);
            } catch (sleepErr) {
                gs.warn("PlaybookCancellationHandler: Sleep interrunted, " + sleepErr.message);
                return;
            }
        }
    },

	_validUser :function() {
		var cuConstants = new global.CriticalUpdatesConstants();
		return gs.hasRole(cuConstants.SC_ADMIN_ROLE);
	},

    getProcessScope: function(processName) {
        var grP = new GlideRecord('sys_pd_process_definition');
        grP.addQuery('name', processName);
        grP.query();
        if (!grP.next()) {
            gs.warn("Failed to find the sys_pd_process_definition for process " + processName);
            return;
        }
        return grP.sys_scope.scope;
    },
    type: 'CriticalUpdateUtil'
};
