var ChangeConflictAPI = Class.create();
ChangeConflictAPI.prototype = {

	CHANGE_CONFLICT_ROLE: "change.conflict.role",

	initialize: function(gr) {
		this._log = new GSLog(ChangeCheckConflicts.CHANGE_CONFLICT_LOG, this.type);

		if (this._log.atLevel(GSLog.DEBUG))
			this._log.logDebug("[initialize]");

		this._gr = gr;
	},

	/**
	 * Cancels and running detection progress jobs and starts a new one
	 */
	startConflictDetection: function() {
		if (!this._gr)
			return null;

		//Check that the user can Check Conflicts
		if (!this._canCheckConflict())
			return gs.getMessage("Insufficient access to start conflict detection");

		return new ChangeConflictExecution(this._gr).scheduleConflictDetection();
	},

	/**
	 * Cancels any running detection progress jobs
	 */
	cancelConflictDetection: function() {
		if (!this._gr)
			return false;

		//Check that the user can Check Conflicts
		if (!this._canCheckConflict())
			return false;

		if ("true" !== gs.getProperty("change.conflict.useprogressworker"))
			return new ChangeConflictExecution(this._gr).cancelChangeMgtWorker();

		// Find the id of any existing trackers running for this change
		var trackerGr = new GlideRecordSecure("sys_execution_tracker");
		trackerGr.addQuery("source", this._gr.getUniqueValue());
		trackerGr.addQuery("name", ChangeCheckConflicts.TRACKER_NAME);
		trackerGr.addQuery("state", "IN", "0,1");
		trackerGr.orderByDesc('sys_created_on');
		trackerGr.query();

		if (this._log.atLevel(GSLog.DEBUG))
			this._log.logDebug("[cancelConflictDetection] " + trackerGr.getEncodedQuery());

		if (trackerGr.next()) {
			var execTracker = new SNC.GlideExecutionTracker(trackerGr.getUniqueValue());
			execTracker.cancel(gs.getMessage("Conflict detection has been cancelled"));
			return true;
		}

		return false;
	},

	/**
	 * Retrieves number of conflict records for this change
	 */
	getConflictCount: function() {
		if (!this._gr || !this._gr.canRead())
			return 0;

		var conflictCount = new GlideAggregate('conflict');
		conflictCount.addQuery('change', this._gr.getUniqueValue());
		conflictCount.addAggregate('COUNT');
		conflictCount.query();

		var conflict = 0;
		if (conflictCount.next())
			conflict = conflictCount.getAggregate('COUNT');

		return conflict;
	},

	/**
	 * Retrieves conflict records for this change
	 */
	getConflicts: function() {
		if (!this._gr || !this._gr.canRead())
			return null;

		var conflictGR = new GlideRecordSecure('conflict');
		conflictGR.addQuery('change', this._gr.getUniqueValue());
		conflictGR.query();

		return conflictGR;
	},

	/**
	 * Retrieves a progress record for this change
	 */
	getProgressRecord: function() {
		if (!this._gr || !this._gr.canRead())
			return null;

		if ("true" !== gs.getProperty("change.conflict.useprogressworker"))
			return new ChangeConflictExecution(this._gr).getChangeMgtWorker();

		var trackerGr = new GlideRecordSecure("sys_execution_tracker");
		trackerGr.addQuery("source", this._gr.getUniqueValue());
		trackerGr.addQuery("name", ChangeCheckConflicts.TRACKER_NAME);
		trackerGr.orderByDesc("sys_created_on");
		trackerGr.query();

		if (this._log.atLevel(GSLog.DEBUG))
			this._log.logDebug("[getProgressRecord] " + trackerGr.getEncodedQuery());

		if (trackerGr.next())
			return trackerGr;

		return;
	},

	_canCheckConflict: function() {
		return gs.hasRole(gs.getProperty(this.CHANGE_CONFLICT_ROLE));
	},

	type: 'ChangeConflictAPI'
};
