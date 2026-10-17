var ProblemStateUtilsSNC = Class.create();

ProblemStateUtilsSNC.USE_MODEL = gs.getProperty("com.snc.problem_management.models.enabled", "false") === "true";

ProblemStateUtilsSNC.prototype = {

	initialize: function(argument) {
		this.moveToClosed = gs.getProperty(this.PROPERTIES.MOVE_TO_CLOSED, "true");
	},

	STATES: {
		ASSESS: ProblemState.STATES.ASSESS,
		ROOT_CAUSE_ANALYSIS: ProblemState.STATES.ROOT_CAUSE_ANALYSIS,
		FIX_IN_PROGRESS: ProblemState.STATES.FIX_IN_PROGRESS,
		RESOLVED: ProblemState.STATES.RESOLVED,
		CLOSED: ProblemState.STATES.CLOSED
	},

	COLUMNS: {
		STATE: "state",
		RESOLUTION_CODE: "resolution_code"
	},

	RESOLUTION_CODES: {
		FIX_APPLIED: "fix_applied",
		CANCELED: "canceled",
		RISK_ACCEPTED: "risk_accepted"
	},

	ROLE_PROP_CHOICES: {
		NOBODY: "-nobody-",
		PROBLEM_COORDINATOR: "problem_coordinator",
		PROBLEM_MANAGER: "problem_manager",
		PROBLEM_ADMIN: "problem_admin"
	},

	PROPERTIES: {
		REANALYZE_FROM_CANCELED: "problem.closed.role.reanalyze_from_canceled",
		REANALYZE_FROM_COMPLETED: "problem.closed.role.reanalyze_from_completed",
		REANALYZE_FROM_RISK_ACCEPTED: "problem.closed.role.reanalyze_from_closed_riskaccepted",
		MOVE_TO_CLOSED: "problem.acceptrisk.move_to_closed"
	},

	validateStateTransition: function(problemGr, state) {

		if (!problemGr || !state || !problemGr.isValid())
			return false;

		if (this._hasModel(problemGr))
			return false;

		if (sn_sm.RecordStateValidator.isValidStateTransition(problemGr, state))
			return true;

		return false;
	},

	canReAnalyze: function(problemGr) {

		if (!problemGr || !problemGr.isValid())
			return false;

		var problemState = problemGr.getValue(this.COLUMNS.STATE);

		if (problemState !== this.STATES.FIX_IN_PROGRESS && problemState !== this.STATES.RESOLVED && problemState !== this.STATES.CLOSED)
			return false;

		var isValidModelTransition = this._hasModel(problemGr) && this._canMoveToStateInModel(problemGr, this.STATES.ROOT_CAUSE_ANALYSIS);
		var isValidStateTransition = this.validateStateTransition(problemGr, this.STATES.ROOT_CAUSE_ANALYSIS);

		if (!isValidModelTransition && !isValidStateTransition)
			return false;

		if (problemState === this.STATES.FIX_IN_PROGRESS || problemState === this.STATES.RESOLVED)
			return true;

		if (problemState === this.STATES.CLOSED) {

			var user = gs.getUser();
			var resolutionCode = problemGr.getValue(this.COLUMNS.RESOLUTION_CODE);
			var reanalyzeFromCompletedRole = gs.getProperty(this.PROPERTIES.REANALYZE_FROM_COMPLETED);
			var reanalyzeFromCanceledRole = gs.getProperty(this.PROPERTIES.REANALYZE_FROM_CANCELED);
			var reanalyzeFromRiskAcceptedRole = gs.getProperty(this.PROPERTIES.REANALYZE_FROM_RISK_ACCEPTED);

			if ((resolutionCode === this.RESOLUTION_CODES.FIX_APPLIED) && (reanalyzeFromCompletedRole !== this.ROLE_PROP_CHOICES.NOBODY) && user.hasRole(reanalyzeFromCompletedRole))
				return true;

			if ((resolutionCode === this.RESOLUTION_CODES.CANCELED) && (reanalyzeFromCanceledRole !== this.ROLE_PROP_CHOICES.NOBODY) && user.hasRole(reanalyzeFromCanceledRole))
				return true;

			if ((resolutionCode === this.RESOLUTION_CODES.RISK_ACCEPTED) && (reanalyzeFromRiskAcceptedRole !== this.ROLE_PROP_CHOICES.NOBODY) && user.hasRole(reanalyzeFromRiskAcceptedRole))
				return true;

		}
		return false;
	},

	canShowAcceptRisk: function(problemGr) {

		if (!problemGr || !problemGr.isValid())
			return false;

		if (problemGr.state + '' !== this.STATES.ROOT_CAUSE_ANALYSIS && problemGr.state + '' !== this.STATES.FIX_IN_PROGRESS)
			return false;

		var state = this.moveToClosed === "true" ? this.STATES.CLOSED : this.STATES.RESOLVED;

		if (this._hasModel(problemGr))
			return this._canMoveToStateInModel(problemGr, state);

		return this.validateStateTransition(problemGr, state);
	},

	canMarkDuplicateOrCancel: function(problemGr) {

		if (!problemGr || !problemGr.isValid())
			return false;

		if (problemGr.state + '' !== this.STATES.ASSESS && problemGr.state + '' !== this.STATES.ROOT_CAUSE_ANALYSIS)
			return false;

		if (this._hasModel(problemGr))
			return this._canMoveToStateInModel(problemGr, this.STATES.CLOSED);

		if (this.validateStateTransition(problemGr, this.STATES.CLOSED))
			return true;
	
		return false;
	},

	canComplete: function(problemGr) {

		if (!problemGr || !problemGr.isValid())
			return false;

		if (problemGr.state + '' !== this.STATES.RESOLVED)
			return false;

		if (this._hasModel(problemGr))
			return this._canMoveToStateInModel(problemGr, this.STATES.CLOSED) && problemGr.resolution_code + '' !== this.RESOLUTION_CODES.RISK_ACCEPTED;
 
		if (this.validateStateTransition(problemGr, this.STATES.CLOSED) && problemGr.resolution_code + '' !== this.RESOLUTION_CODES.RISK_ACCEPTED)
			return true;

		return false;
	},

	canResolve: function(problemGr) {

		if (!problemGr || !problemGr.isValid())
			return false;

		if (problemGr.state + '' !== this.STATES.FIX_IN_PROGRESS)
			return false;

		if (this._hasModel(problemGr))
			return this._canMoveToStateInModel(problemGr, this.STATES.RESOLVED);

		if (this.validateStateTransition(problemGr, this.STATES.RESOLVED))
			return true;

		return false;
	},

	canConfirm: function(problemGr) {

		if (!problemGr || !problemGr.isValid())
			return false;

		if (problemGr.state + '' !== this.STATES.ASSESS)
			return false;

		if (this._hasModel(problemGr))
			return this._canMoveToStateInModel(problemGr, this.STATES.ROOT_CAUSE_ANALYSIS);

		if (this.validateStateTransition(problemGr, this.STATES.ROOT_CAUSE_ANALYSIS))
			return true;

		return false;
	},

	canFix: function(problemGr) {

		if (!problemGr || !problemGr.isValid())
			return false;

		if (problemGr.state + '' === this.STATES.FIX_IN_PROGRESS)
			return false;

		if (this._hasModel(problemGr))
			return this._canMoveToStateInModel(problemGr, this.STATES.FIX_IN_PROGRESS);

		if (this.validateStateTransition(problemGr, this.STATES.FIX_IN_PROGRESS))
			return true;

		return false;
	},

	canAssess: function(problemGr) {

		if (!problemGr || !problemGr.isValid())
			return false;

		if (problemGr.state + '' === this.STATES.ASSESS)
			return false;

		if (this._hasModel(problemGr))
			return this._canMoveToStateInModel(problemGr, this.STATES.ASSESS);

		if (this.validateStateTransition(problemGr, this.STATES.ASSESS))
			return true;

		return false;
	},

	onReAnalyze: function(problemGr) {

		if(!problemGr || !problemGr.isValid())
			return false;

		problemGr.setValue(this.COLUMNS.STATE, this.STATES.ROOT_CAUSE_ANALYSIS);
		problemGr.update();
	},
	
	getReqFieldsFromUI: function(viewName) {

		var fields = [];
		var uiElementGr = new GlideRecord('sys_ui_element');
		uiElementGr.addQuery('sys_ui_section.view.name', viewName);
		uiElementGr.query();
		while (uiElementGr.next())
			fields.push(uiElementGr.element + '');
		return fields;
	},

	isClosed: function(problemGr) {

		if (problemGr.getValue(this.COLUMNS.STATE) === this.STATES.CLOSED)
			return true;

		return false;
	},

	_hasModel: function (problemGr) {
		return (problemGr.isValidField('prb_model') && !problemGr.prb_model.nil());
	},

	_canMoveToStateInModel: function (problemGr, moveToState) {
		return new Problem(problemGr).isNextManualState(moveToState);
	},

	type: 'ProblemStateUtilsSNC'
};
