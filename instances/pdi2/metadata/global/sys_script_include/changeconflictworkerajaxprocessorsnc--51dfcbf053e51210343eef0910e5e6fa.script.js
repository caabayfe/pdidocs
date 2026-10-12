var ChangeConflictWorkerAJAXProcessorSNC = Class.create();
ChangeConflictWorkerAJAXProcessorSNC.prototype = Object.extendsObject(AbstractAjaxProcessor, {

	NOT_RUN: "Not Run",
	CHG_MGT_WORKER: "chg_mgt_worker",

	check: function() {
		var sysId = this.getParameter("sysparm_sysid");
		var chgMgtWorkerGR = new GlideRecordSecure(this.CHG_MGT_WORKER);
		chgMgtWorkerGR.addQuery("source_record", sysId);
		chgMgtWorkerGR.addQuery("type", "conflict_detection");
		chgMgtWorkerGR.addQuery("state", "IN", "1,2");
		chgMgtWorkerGR.setLimit(1);
		chgMgtWorkerGR.query();
		if (chgMgtWorkerGR.next())
			return chgMgtWorkerGR.getUniqueValue();
		return "";
	},

	start: function() {
		var workerSysId = this.check();
		if (workerSysId)
			return workerSysId;

		var sysId = this.getParameter("sysparm_sysid");
		var changeRequestGR = new GlideRecordSecure("change_request");
		if (!changeRequestGR.get(sysId))
			return "";

		return new ChangeConflictExecution(changeRequestGR).startChangeMgtWorker();
	},

	cancel: function() {
		var workerSysId = this.getParameter("sysparm_worker_id");
		if (!workerSysId)
			return false;

		new ChangeConflictExecution(null).cancelChangeMgtWorker(workerSysId);
	},

	deleteConflicts: function() {
		var changeSysId = this.getParameter("sysparm_sys_id") + "";
		var workerSysId = this.getParameter("sysparm_worker_id") + "";

		// If a more recent tracker is available, do not change conflict status or remove conflicts.
		var chgMgtWorker = new GlideRecordSecure(this.CHG_MGT_WORKER);
		chgMgtWorkerGR.addQuery("source_record", changeSysId);
		chgMgtWorkerGR.addQuery("type", "conflict_detection");
		chgMgtWorkerGR.orderByDesc("sys_created_on");
		chgMgtWorkerGR.setLimit(1);
		if (chgMgtWorkerGR.next() && workerSysId !== chgMgtWorkerGR.getUniqueValue())
			return "NEWER_TRACKER_FOUND";

		new ChangeConflictHandler().deleteConflictsByChangeId(changeSysId, true);

		//Update conflict status and last run
		var changeGr = new GlideRecordSecure("change_request");
		if (changeGr.get(changeSysId)) {
			changeGr.conflict_status = this.NOT_RUN;
			changeGr.conflict_last_run = "";
			changeGr.update();
			return "CHANGE_CONFLICT_RESET";
		}
	},

	getWorkerRecord: function() {
		var workerSysId = this.getParameter("sysparm_worker_id");

		var workerJSON = {};
		workerJSON.state = 0;
		workerJSON.percent = 0;
		workerJSON.percent_complete = 0;
		workerJSON.timestamp = new GlideDateTime().getDisplayValue();

		if (workerSysId !== "") {
			var chgMgtWorkerGR = new GlideRecordSecure(this.CHG_MGT_WORKER);
			if (chgMgtWorkerGR.get(workerSysId)) {
				workerJSON.state = chgMgtWorkerGR.getValue("state");
				workerJSON.percent = chgMgtWorkerGR.getValue("percent_complete");
				workerJSON.percent_complete = chgMgtWorkerGR.getValue("percent_complete");
				workerJSON.timestamp = new GlideDateTime().getDisplayValue();
			}
		}

		return new JSON().encode(workerJSON);
	},

	getConflictData: function() {
		var changeId = this.getParameter('sysparm_change_id');

		var conflictGr = new GlideRecordSecure('conflict');
		conflictGr.addQuery('change', changeId);
		conflictGr.orderByDesc("last_checked");
		conflictGr.query();
		var conflictCount = conflictGr.getRowCount();
		var timestamp = new GlideDateTime().getDisplayValue();
		if (conflictGr.next())
			timestamp = conflictGr.getDisplayValue("last_checked");
		var conflictInfo = {
			conflictCount: conflictCount,
			timestamp: timestamp
		};
		return new JSON().encode(conflictInfo);
	},

	getStatus: function(workerId) {
		var workerSysId = this.getParameter("sysparm_worker_id") || workerId;
		var chgMgtWorkerGR = new GlideRecordSecure(this.CHG_MGT_WORKER);
		if (chgMgtWorkerGR.get(workerSysId)) {
			var status = this.getStatusLayer(chgMgtWorkerGR, chgMgtWorkerGR.canRead());
			return new JSON().encode(status);
		} else {
			// Worker not found
			var noWorkerObj = {};
			var RecordNotFoundMsg = GlideSysMessage.format("Record not found");
			noWorkerObj.name = RecordNotFoundMsg;
			noWorkerObj.message = RecordNotFoundMsg;
			// State value -1 will tell the client API to stop polling for progress, as record not found
			noWorkerObj.state = "-1";
			noWorkerObj.sys_id = workerSysId;
			noWorkerObj.children = [];
			noWorkerObj.results = [];
			return new JSON().encode(noWorkerObj);
		}
	},

	getStatusLayer: function(chgMgtWorkerGR, hasReadAccess) {
		var obj = {};
		if (hasReadAccess) {
			obj.name = chgMgtWorkerGR.getDisplayValue("type");
			obj.state = chgMgtWorkerGR.getValue("state");
			var rawMsg = chgMgtWorkerGR.getDisplayValue("message");
			var translatedMsg = rawMsg;
			var knownMessages = {
				"The conflict check is complete": gs.getMessage("The conflict check is complete"),
				"Checking already scheduled CIs": gs.getMessage("Checking already scheduled CIs"),
				"Checking attached maintenance schedules": gs.getMessage("Checking attached maintenance schedules"),
				"Checking maintenance schedules": gs.getMessage("Checking maintenance schedules"),
				"Checking blackout schedules": gs.getMessage("Checking blackout schedules"),
				"Checking already assigned change requests": gs.getMessage("Checking already assigned change requests"),
				"Checking Information schedules": gs.getMessage("Checking Information schedules"),
				"Saving conflicts data": gs.getMessage("Saving conflicts data")
			};
			if (knownMessages.hasOwnProperty(rawMsg))
				translatedMsg = knownMessages[rawMsg];
			obj.message = translatedMsg;
			obj.detail_message = translatedMsg;
			obj.result = "result";
			obj.sys_id = chgMgtWorkerGR.getUniqueValue();
			obj.percent_complete = chgMgtWorkerGR.getDisplayValue("percent_complete");
			obj.updated_on = chgMgtWorkerGR.getDisplayValue("sys_updated_on");
			obj.duration = "";

			var startTime = new GlideDateTime(chgMgtWorkerGR.getValue("sys_created_on"));
			var state = chgMgtWorkerGR.getValue("state");
			if ("3" === state || "4" === state || "5" === state) {
				var endTime = new GlideDateTime(chgMgtWorkerGR.getValue("sys_updated_on"));
				var duration = new GlideDuration(endTime.getNumericValue() - startTime.getNumericValue());
				obj.duration = duration.getDisplayValue();
			}
		} else {
			var AccessDeniedMsg = GlideSysMessage.format("Access denied");
			obj.name = AccessDeniedMsg;
			obj.message = AccessDeniedMsg;
			obj.state = "2";
			// State value 1 lets the client API know it may be "Running", instead of abruptly saying we are done and break client rendering
			// Running state help the client to continue poll, if somehow access opens up after a bit. Example: ATF impersonation use case
			obj.sys_id = chgMgtWorkerGR.getUniqueValue();
		}

		obj.children = [];
		obj.results = [];
		return obj;
	},

	updatePositionMessage : function() {
		var workerSysId = this.getParameter("sysparm_worker_id");
		var chgMgtWorkerGR = new GlideRecordSecure(this.CHG_MGT_WORKER);
		chgMgtWorkerGR.get(workerSysId);

		// Invalid or not in "Waiting" state
		if (!chgMgtWorkerGR.isValid() || "1" !== chgMgtWorkerGR.getValue("state"))
			return false;

		chgMgtWorkerGR.setValue("message", gs.getMessage("Waiting for Conflict Detection to start"));
		chgMgtWorkerGR.update();
		return true;
	},

    type: 'ChangeConflictWorkerAJAXProcessorSNC'
});
