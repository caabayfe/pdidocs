var ChangeProposed = Class.create();
ChangeProposed.prototype = {
    initialize: function(grParent, grCurrent) {

		function lookupChange(sysId) {
			var changeGr = new GlideRecord("change_request");
			if (changeGr.get(sysId))
				return changeGr;
			
			return null;
		}

		var TASK = "task";
		var TASK_CI = "task_ci";
		var CHANGE_REQUEST = "change_request";

		this._log = new GSLog("com.snc.change_management.log",this.type);
		this._isChangeTask = false;
		this._changeRequest = null;

		// We need a param to initialise any further elements.
		this._gr = !grParent || typeof grParent === "undefined" ? grCurrent : grParent;
		if (!this._gr)
			return;

		// Check if we've been passed a string sys_id
		if (typeof this._gr.getTableName === "undefined") {
			var taskCIGR = new GlideRecord(TASK_CI);
			if (!taskCIGR.get(this._gr))	{
				this._log.error("[init] Unknown task_ci sysId: " + this._gr);
				this._gr = null;
				return;
			}
			this._gr = taskCIGR;
		}

		// Get the related task if we've been given a task ci.
		var tableName = this._gr.getTableName();
		if (tableName === TASK_CI || GlideDBObjectManager.get().isInstanceOf(tableName, TASK_CI)) {
			if (this._log.atLevel(GSLog.DEBUG))
				this._log.debug("[init] Got task_ci:" + this._gr.getUniqueValue() + ". Looking up task.");
			
			this._gr = lookupChange(this._gr.task.getValue());
		}

		// We need to check if we have a task rather than the change request
		var changeRequest = new ChangeRequest(this._gr);
		if (this._gr && this._gr.getTableName() === TASK && !changeRequest.isValidTable())
			this._gr = lookupChange(this._gr.getUniqueValue());

		if (!this._gr)
			return;

		// At this point we have the task in this._gr and just need to check if it's a change request.
		this._changeRequest = new ChangeRequest(this._gr);
		if (!this._changeRequest.isValidTable()) {
			if (this._log.atLevel(GSLog.DEBUG))
				this._log.debug("[init] Related Task is not a Change Request.");

			this._gr = null;
			this._changeRequest = null;
		}
    },

	relatedTaskIsChangeRequest: function () {
		return this._changeRequest !== null && this._changeRequest.isValidTable();
	},

	/**
	 * If affected CIs can be added to the Change Request 
	 */
	canAddCI: function() {
		// If it's not a change request (or extension), return true and let other conditions decide
		// This has to be done as the Add CI action could be used on all types of tasks
		return !this.relatedTaskIsChangeRequest() || (this.relatedTaskIsChangeRequest() && this._changeRequest.canModifyCI());
	},
	
	/**
	 * You can only propose a CI change related to a new Change Request.
	 */
	canProposeChange: function() {
		if (this.relatedTaskIsChangeRequest() && this._changeRequest.canModifyCI())
			return true;
		
		if (this._log.atLevel(GSLog.DEBUG))
			this._log.debug("[canProposeChange] Cannot propose CI change for Change Request " + this._grChgReq.number + ":" + this._grChgReq.getUniqueValue());
		
		return false;
	},
	
    type: 'ChangeProposed'
};
