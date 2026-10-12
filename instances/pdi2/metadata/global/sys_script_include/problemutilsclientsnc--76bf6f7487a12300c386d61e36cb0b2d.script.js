var ProblemUtilsClientSNC = Class.create();
ProblemUtilsClientSNC.prototype = Object.extendsObject(AbstractAjaxProcessor, {

    initialize: function(request, responseXML, gc) {
        global.AbstractAjaxProcessor.prototype.initialize.call(this, request, responseXML, gc);
    },

    ROLES: {
        PROBLEM_COORDINATOR: new ProblemStateUtils().ROLE_PROP_CHOICES.PROBLEM_COORDINATOR
    },

    submitForm: function() {
        var tableName = this.getParameter('sysparm_record_type');
        var pTaskExts = new TableUtils("problem_task").getAllExtensions();
        if (tableName == 'problem' || pTaskExts.indexOf(tableName) !== -1) {
            var sys_id = this.getParameter('sysparm_sys_id');
            var fieldsToBeUpdated = JSON.parse(this.getParameter('sysparm_fields'));
            var recordGr = new GlideRecord(tableName);
            recordGr.get(sys_id);
            if (recordGr.isValidRecord() && recordGr.canWrite()) {
                if ('state' in fieldsToBeUpdated && !this.hasValidRoleForStateUpdate(tableName))
                    return false;
                for (var field in fieldsToBeUpdated) {
                    recordGr[field + ""] = fieldsToBeUpdated[field];
                }
                if (recordGr.update())
                    return true;
            }
            return false;
        } else {
            gs.error("Invalid Record Type");
            return false;
        }
    },
    hasValidRoleForStateUpdate: function(tableName) {
        // Check if the user has 'problem_coordinator' role for problem 
        // and 'problem_task_analyst' role for problem_task
        var user = gs.getUser();
        if (tableName == 'problem' && !user.hasRole('problem_coordinator')) {
            gs.error("User does not have the required 'problem_coordinator' role to update the 'state' field.");
            return false;
        } else if (tableName == 'problem_task' && !user.hasRole('problem_task_analyst')) {
            gs.error("User does not have the required 'problem_task_analyst' role to update the 'state' field.");
            return false;
        }
        return true;
    },
    isDisplayBackgroundMoveMessage: function() {
        var problemUtil = new ProblemV2Util();
        var recordsToMove = gs.getProperty("problem.duplicate.records_to_move");
        var recordsMap = problemUtil.dotCommaToMap(recordsToMove.split(","));
        var record;
        var gr;
        for (record in recordsMap) {
            gr = new GlideRecord(record);
            if (gr.isValid()) {
                gr.addQuery(recordsMap[record], this.getParameter('sysparm_srcPrbSysId'));
                gr.setLimit(1);
                gr.query();
                // Even if one record exist with parent as the Source Problem return true. 
                if (gr.hasNext())
                    return true;
            }
        }
        return false;
    },
    isDisplayWarningTaskMove: function() {
        var recordsToMove = gs.getProperty("problem.duplicate.records_to_move");
        // If Moving of PTASKs is specified
        if (recordsToMove && recordsToMove.split(",").indexOf('problem_task.problem') !== -1) {
            // If Cascade closure of PTASK is enabled 
            if (gs.getProperty("problem.closed.cancel_open_tasks") === 'true') {
                // If The target PRB is Closed
                var targetProbRecord = new GlideRecord('problem');
                targetProbRecord.get(this.getParameter('sysparm_trgtPrbSysId'));
                // If target PRB is Closed
                if (targetProbRecord.isValidRecord() && targetProbRecord.state + "" === ProblemState.STATES.CLOSED) {
                    var grPTask = new GlideRecord('problem_task');
                    if (grPTask.isValid()) {
                        grPTask.addQuery('problem', this.getParameter('sysparm_srcPrbSysId'));
                        grPTask.query();
                        while (grPTask.hasNext()) {
                            grPTask.next();
                            // If source Problem's Ptask are OPEN
                            if (grPTask.state != ProblemTaskState.States.CLOSED) {
                                return true;
                            }
                        }
                    }
                }
            }
        }
        // If any of 4 conditions are not met simple return false. 
        return false;
    },

    isDisplayReassessInfoForClosedPrb: function() {
        var ptaskGr = new GlideRecord("problem_task");
        if (ptaskGr.get(this.getParameter('sysparm_ptaskSysId'))) {
            var ptaskStateUtil = new ProblemTaskStateUtils();
            return (ptaskStateUtil.canReassessPtask(ptaskGr) && !ptaskStateUtil.canReassessPtaskForClosedPrb(ptaskGr));
        }
        return false;
    },
    shareFixNotes: function() {
        try {
            var problemGr = new GlideRecord("problem");
            var sys_id = this.getParameter('sys_id');
            var user = gs.getUser();

            if (problemGr.get(sys_id) && user.hasRole(this.ROLES.PROBLEM_COORDINATOR)) {
                var time = new GlideDateTime();
                problemGr.setValue('fix_communicated_at', time);
                problemGr.setValue('fix_communicated_by', gs.getUserID());
                problemGr.update();
                gs.eventQueue('communicate.fix', problemGr, problemGr.fix_notes);
            }
        } catch (ex) {
            gs.error("Exception in ProblemUtilsClientSNC.shareFixNotes" + ex);
        }

    },
    shareWorkaround: function() {
        try {
            var problemGr = new GlideRecord("problem");
            var sys_id = this.getParameter('sys_id');
            var user = gs.getUser();

            if (problemGr.get(sys_id) && user.hasRole(this.ROLES.PROBLEM_COORDINATOR)) {
                var time = new GlideDateTime();
                problemGr.setValue('workaround_communicated_at', time);
                problemGr.setValue('workaround_communicated_by', gs.getUserID());
                problemGr.update();
                gs.eventQueue('communicate.workaround', problemGr, problemGr.workaround);
            }
        } catch (ex) {
            gs.error("Exception in ProblemUtilsClientSNC.shareWorkaround" + ex);
        }

    },
    type: 'ProblemUtilsClientSNC'
});
