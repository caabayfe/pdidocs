var ChangeConflictExecutionSNC = Class.create();

ChangeConflictExecutionSNC.CHANGE_CONFLICT_EXECUTION_LOG = "change.conflict.execution.log";
ChangeConflictExecutionSNC.CHANGE_CONFLICT_REFRESH_CONFLICTS = "change.conflict.refresh.conflicts";
ChangeConflictExecutionSNC.CHANGE_CONFLICT_CHECK_CONFLICT_LAST_RUN_UPDATED = "change.conflict.check_conflict_last_run_updated";

ChangeConflictExecutionSNC.prototype = {

	initialize: function(_gr, _gs) {
		this._gr = _gr || current;
		this._gs = _gs || gs;

		this.lu = new GSLog(ChangeConflictExecutionSNC.CHANGE_CONFLICT_EXECUTION_LOG, this.type);
		this.lu.includeTimestamp();
	},

	scheduleConflictDetection: function() {
		if (this.lu.atLevel(GSLog.DEBUG))
			this.lu.logDebug("Scheduling conflict detection for " + this._gr.getRecordClassName() + ": " + this._gr.getUniqueValue());

		if (gs.getProperty(ChangeConflictExecutionSNC.CHANGE_CONFLICT_REFRESH_CONFLICTS, "false") !== "true") {
			if (this.lu.atLevel(GSLog.DEBUG))
				this.lu.logDebug("Conflict detection skipped; refresh conflicts disabled");
			return;
		}

		if (!ChangeCheckConflicts.allowConflictDetection(this._gr)) {
			if (this.lu.atLevel(GSLog.DEBUG))
				this.lu.logDebug("Conflict detection skipped; conflict detection not allowed");
			return;
		}

		if (gs.getProperty(ChangeConflictExecutionSNC.CHANGE_CONFLICT_CHECK_CONFLICT_LAST_RUN_UPDATED, "true") === "true" && this._gr.conflict_last_run.changes()) {
			if (this.lu.atLevel(GSLog.DEBUG))
				this.lu.logDebug("Conflict detection skipped; conflict_last_run has been updated");
			return;
		}

		var contextId = null;
		if ("true" === gs.getProperty("change.conflict.useprogressworker")) {
			// Latest version of the Change should be used for conflict detection so cancel existing running conflict worker
			this.cancelChangeConflictWorker();
			contextId = this.startChangeConflictWorker();
		} else {
			this.cancelChangeMgtWorker();
			contextId = this.startChangeMgtWorker();
		}

		return contextId;
	},

	startChangeMgtWorker: function() {
		this._gs.getSession().putClientData("conflictWorker_" + this._gr.getUniqueValue(), "");

		var worker = new GlideRecordSecure("chg_mgt_worker");
		worker.initialize();
		worker.setValue("source_table", this._gr.getRecordClassName());
		worker.setValue("source_record", this._gr.getUniqueValue());
		worker.setValue("type", "conflict_detection");
		worker.setValue("percent_complete", 0);
		worker.setValue("state", "1");
		var workerSysId = worker.insert();

		this._gs.getSession().putClientData("conflictWorker_" + this._gr.getUniqueValue(), workerSysId);

		return workerSysId;
	},

	getChangeMgtWorker: function(workerSysId) {
		var worker = new GlideRecordSecure("chg_mgt_worker");
		if (workerSysId && worker.get(workerSysId))
			return worker;

		if (!this._gr || !this._gr.isValid || !this._gr.isValid())
			return false;

		worker.initialize();
		worker.addQuery("source_table", this._gr.getRecordClassName());
		worker.addQuery("source_record", this._gr.getUniqueValue());
		worker.addQuery("type", "conflict_detection");
		worker.addQuery("state", "IN", "1,2");
		worker.orderByDesc("sys_created_on");
		worker.query();

		if (worker.next())
			return worker;

		return;
	},

	cancelChangeMgtWorker: function(workerSysId) {
		var worker = new GlideRecordSecure("chg_mgt_worker");
		if (workerSysId && worker.get(workerSysId)) {
			worker.setValue("state", "5");
			worker.setValue("message", gs.getMessage("Conflict detection has been canceled"));
			return worker.update();
		}

		if (!this._gr || !this._gr.isValid || !this._gr.isValid())
			return false;

		worker.initialize();
		worker.addQuery("source_table", this._gr.getRecordClassName());
		worker.addQuery("source_record", this._gr.getUniqueValue());
		worker.addQuery("type", "conflict_detection");
		worker.addQuery("state", "IN", "1,2");
		worker.query();
		worker.setValue("state", "5");
		worker.setValue("message", gs.getMessage("Conflict detection has been canceled"));
		worker.updateMultiple();
		return true;
	},

	checkChangeConflicts: function(changeSysId, workerSysId) {
		var changeGR = new GlideRecord("change_request");
		if (!changeGR.get(changeSysId))
			return -1;

		return new ChangeCheckConflicts(changeGR, {
			"worker_sys_id": workerSysId
		}).checkAndUpdate();
	},

	cancelChangeConflictWorker: function() {
		var trackerGr = new GlideRecord("sys_execution_tracker");
		trackerGr.addQuery("source", this._gr.getUniqueValue());
		trackerGr.addQuery("name", ChangeCheckConflicts.TRACKER_NAME);
		trackerGr.addQuery("state", "1");
		trackerGr.query();

		if (trackerGr.next()) {
			if (this.lu.atLevel(GSLog.DEBUG))
				this.lu.logDebug("Change conflict worker cancelled: " + trackerGr.getUniqueValue());
			SNC.GlideExecutionTracker.getBySysID(trackerGr.getUniqueValue()).cancel(gs.getMessage("The conflict check has been cancelled because the change request it was being run against has been modified"));
		}
	},

	startChangeConflictWorker: function() {
		this._gs.getSession().putClientData('tracker_' + this._gr.getUniqueValue(), '');

		var worker = new GlideScriptedHierarchicalWorker();
		worker.setProgressName(ChangeCheckConflicts.TRACKER_NAME);
		worker.setScriptIncludeName("ChangeConflictWorker");
		worker.setScriptIncludeMethod("start");
		worker.putMethodArg("sysId", this._gr.getUniqueValue());
		worker.putMethodArg("className", this._gr.getRecordClassName());
		worker.setBackground(true);
		worker.start();

		var workerId = worker.getProgressID();

		if (this.lu.atLevel(GSLog.DEBUG))
			this.lu.logDebug("Change conflict worker started: " + workerId);

		this._gs.getSession().putClientData('tracker_' + this._gr.getUniqueValue(), workerId);

		return workerId;
	},

	type: 'ChangeConflictExecutionSNC'
};
