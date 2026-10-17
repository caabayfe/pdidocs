var ProblemTaskStateUtilsSNC = Class.create();

ProblemTaskStateUtilsSNC.prototype = {

    STATES: {
        ASSESS: ProblemTaskState.States.ASSESS,
        WORK_IN_PROGRESS: ProblemTaskState.States.WORK_IN_PROGRESS,
        CLOSED: ProblemTaskState.States.CLOSED,
        NEW: ProblemTaskState.States.NEW
    },

    COLUMNS: {
        STATE: 'state',
        CLOSE_CODE: 'close_code',
    },

    PROPERTIES: {
        REASSESS_FROM_CLOSED: 'problem_task.closed.role.reaassess_from_closed',
        CLOSED_PROBLEM_CAN_CREATE_PROBLEM_TASK: 'problem.closed.can_create_tasks',
        CAN_REASSESS_PTASK_WHEN_CLOSED_PRB: 'problem_task.closed.can_reassess_on_closed_problem',
        LOG_PROPERTY: 'com.snc.itsm.problem.problem_task_state.log'
    },

    ROLE_PROP_CHOICES: {
        NOBODY: '-nobody-',
        PROBLEM_COORDINATOR: 'problem_coordinator',
        PROBLEM_ANALYST: 'problem_task_analyst'
    },

    initialize: function(argument) {
        this.log = new GSLog(this.PROPERTIES.LOG_PROPERTY, this.type).setLog4J();
    },

    validateStateTransition: function(problemTaskGr, state) {
        if (this.log.atLevel(GSLog.DEBUG))
            this.log.debug('[validateStateTransition] problemTaskGr sys_id: ' + problemTaskGr.sys_id + ' - state: ' + state);

        if (!problemTaskGr || !state || !problemTaskGr.isValid())
            return false;

        if (this.log.atLevel(GSLog.DEBUG))
            this.log.debug('[validateStateTransition] state from: ' + problemTaskGr.state + '(' + problemTaskGr.getDisplayValue('state') + ')' + ' - state to: ' + state);

        var isValidStateTransition = sn_sm.RecordStateValidator.isValidStateTransition(problemTaskGr, state);

        if (this.log.atLevel(GSLog.DEBUG))
            this.log.debug('[validateStateTransition] isValidStateTransition: ' + isValidStateTransition);

        return (isValidStateTransition);
    },

    canReassessPtask: function(problemTaskGr) {
        if (problemTaskGr.state + '' === this.STATES.NEW || problemTaskGr.state + '' === this.STATES.ASSESS)
            return false;

        var isValidModelTransition = this._hasModel(problemTaskGr) && this._canMoveToStateInModel(problemTaskGr, this.STATES.ASSESS);
        var isValidStateTransition = !this._hasModel(problemTaskGr) && this.validateStateTransition(problemTaskGr, this.STATES.ASSESS);

        if (this.log.atLevel(GSLog.DEBUG))
            this.log.debug('[canReassessPtask] isValidModelTransition: ' + isValidModelTransition + ' - isValidStateTransition: ' + isValidStateTransition);

        // If it is not a valid model transition and not a valid state transition, return early
        if (!isValidModelTransition && !isValidStateTransition)
            return false;

        // If transition is valid, check state and roles are valid
        var reassessFromClosedRole = gs.getProperty(this.PROPERTIES.REASSESS_FROM_CLOSED);
        var canUserReassessFromClose = gs.getUser().hasRole(reassessFromClosedRole);

        if (this.log.atLevel(GSLog.DEBUG))
            this.log.debug('[canReassessPtask] reassessFromClosedRole: ' + reassessFromClosedRole + ' - canUserReassessFromClose: ' + canUserReassessFromClose);

        return ((problemTaskGr.state + '' === this.STATES.WORK_IN_PROGRESS && gs.getUser().hasRole(this.ROLE_PROP_CHOICES.PROBLEM_ANALYST)) || ((reassessFromClosedRole !== this.ROLE_PROP_CHOICES.NOBODY) && canUserReassessFromClose));
    },

    canReassessPtaskForClosedPrb: function(problemTaskGr) {
        var canReassessWhenPrbClosed = gs.getProperty(this.PROPERTIES.CAN_REASSESS_PTASK_WHEN_CLOSED_PRB) + '' === 'true';

        if (this.log.atLevel(GSLog.DEBUG))
            this.log.debug('[canReassessPtaskForClosedPrb] canReassessWhenPrbClosed: ' + canReassessWhenPrbClosed + ' - problemTaskGr.problem.state: ' + problemTaskGr.problem.state);

        if (problemTaskGr.problem.state + '' === ProblemState.STATES.CLOSED && !canReassessWhenPrbClosed)
            return false;
        return true;
    },

    isAllowedToReAssess: function(problemTaskGr) {
        var canReassessPTask = this.canReassessPtask(problemTaskGr);
        var canReassessPtaskForClosedPrb = this.canReassessPtaskForClosedPrb(problemTaskGr);

        if (this.log.atLevel(GSLog.DEBUG))
            this.log.debug('[isAllowedToReAssess] canReassessPTask: ' + canReassessPTask + ' - canReassessPtaskForClosedPrb: ' + canReassessPtaskForClosedPrb);

        return canReassessPTask && this.canReassessPtaskForClosedPrb(problemTaskGr);
    },

    isAllowedToAssess: function(problemTaskGr) {
        if (this.log.atLevel(GSLog.DEBUG))
            this.log.debug('[isAllowedToAssess] problemTaskGr.state: ' + +problemTaskGr.state + '(' + problemTaskGr.getDisplayValue('state') + ')');

        if (problemTaskGr.state + '' !== this.STATES.NEW)
            return false;

        if (this._hasModel(problemTaskGr))
            return this._canMoveToStateInModel(problemTaskGr, this.STATES.ASSESS);

        return (this.validateStateTransition(problemTaskGr, this.STATES.ASSESS));
    },

    isAllowedToCancel: function(problemTaskGr) {
        if (this.log.atLevel(GSLog.DEBUG))
            this.log.debug('[isAllowedToCancel] problemTaskGr.state: ' + problemTaskGr.state + '(' + problemTaskGr.getDisplayValue('state') + ')');

        if (problemTaskGr.state + '' !== this.STATES.ASSESS && problemTaskGr.state + '' !== this.STATES.WORK_IN_PROGRESS)
            return false;

        if (!this._isAllowedToClose())
            return false;

        if (this._hasModel(problemTaskGr))
            return this._canMoveToStateInModel(problemTaskGr, this.STATES.CLOSED);

        return this.validateStateTransition(problemTaskGr, this.STATES.CLOSED);
    },

    isAllowedToComplete: function(problemTaskGr) {
        if (this.log.atLevel(GSLog.DEBUG))
            this.log.debug('[isAllowedToComplete] problemTaskGr.state: ' + problemTaskGr.state + '(' + problemTaskGr.getDisplayValue('state') + ')');

        if (problemTaskGr.state + '' !== this.STATES.WORK_IN_PROGRESS)
            return false;

        if (!this._isAllowedToClose())
            return false;

        if (this._hasModel(problemTaskGr))
            return this._canMoveToStateInModel(problemTaskGr, this.STATES.CLOSED);

        return this.validateStateTransition(problemTaskGr, this.STATES.CLOSED);
    },

    isAllowedToWork: function(problemTaskGr) {
        if (this.log.atLevel(GSLog.DEBUG))
            this.log.debug('[isAllowedToWork] problemTaskGr.state: ' + problemTaskGr.state + '(' + problemTaskGr.getDisplayValue('state') + ')');

        if (problemTaskGr.state + '' === this.STATES.WORK_IN_PROGRESS)
            return false;

        if (this._hasModel(problemTaskGr))
            return this._canMoveToStateInModel(problemTaskGr, this.STATES.WORK_IN_PROGRESS);

        return this.validateStateTransition(problemTaskGr, this.STATES.WORK_IN_PROGRESS);
    },

    _isAllowedToClose: function() {
        var userHasRole = gs.getUser().hasRole(this.ROLE_PROP_CHOICES.PROBLEM_ANALYST);

        if (this.log.atLevel(GSLog.DEBUG))
            this.log.debug('[_isAllowedToClose] userHasRole: ' + userHasRole);

        return userHasRole;
    },

    onReAssess: function(problemTaskGr) {
        if (!problemTaskGr || !problemTaskGr.isValid())
            return false;

        problemTaskGr.setValue(this.COLUMNS.STATE, this.STATES.ASSESS);
        problemTaskGr.update();
    },

    canCreateProblemTask: function(source) {
        if (source.state + '' === ProblemState.STATES.CLOSED && gs.getProperty(this.PROPERTIES.CLOSED_PROBLEM_CAN_CREATE_PROBLEM_TASK) + '' === 'false')
            return false;
        return true;
    },

    _hasModel: function(problemTaskGr) {
        // Ptask must be in line with Problem, if Problem uses model, then Ptask uses model
        var hasValidPrbModelField = problemTaskGr.problem && problemTaskGr.problem.getRefRecord().isValidField('prb_model');

        if (this.log.atLevel(GSLog.DEBUG))
            this.log.debug('[_hasModel] hasValidPrbModel: ' + hasValidPrbModelField + ' - problemTaskGr.problem(' + problemTaskGr.problem.sys_id + ').prb_model: ' + problemTaskGr.problem.prb_model);

        if (hasValidPrbModelField)
            return !problemTaskGr.problem.prb_model.nil();

        // If, for any reason, Ptask doesn't have a Problem associated, then check prb_task_model field
        var hasValidPrbTaskModel = problemTaskGr.isValidField('prb_task_model') && !problemTaskGr.prb_task_model.nil();

        if (this.log.atLevel(GSLog.DEBUG))
            this.log.debug('[_hasModel] hasValidPrbTaskModel: ' + hasValidPrbTaskModel);

        return hasValidPrbTaskModel;
    },

    _canMoveToStateInModel: function(problemTaskGr, moveToState) {
        if (this.log.atLevel(GSLog.DEBUG))
            this.log.debug('[_canMoveToStateInModel] problemTaskGr.state: ' + problemTaskGr.state + '(' + problemTaskGr.getDisplayValue('state') + ')' + ' - to state: ' + moveToState);

        return new ProblemTask(problemTaskGr).isNextManualState(moveToState);
    },

    type: 'ProblemTaskStateUtilsSNC'
};
