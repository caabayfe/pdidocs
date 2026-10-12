var ChangeConflictAJAXProcessor = Class.create();

ChangeConflictAJAXProcessor.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	NOT_RUN: "Not Run",

	check: function() {
		var sysId = this.getParameter("sysparm_sysid");
		var trackerGr = new GlideRecordSecure("sys_execution_tracker");
		trackerGr.addQuery("source", sysId);
		trackerGr.addQuery("name", ChangeCheckConflicts.TRACKER_NAME);
		trackerGr.addQuery("state", "IN", "0,1");
		trackerGr.query();
		if (trackerGr.next())
			return trackerGr.getUniqueValue();
		return "";
	},

	start: function() {
		var trackerId = this.check();
		if (trackerId)
			return trackerId;

		var sysId = this.getParameter("sysparm_sysid");
		var worker = new GlideScriptedHierarchicalWorker();
		worker.setProgressName(ChangeCheckConflicts.TRACKER_NAME);
		worker.setScriptIncludeName("ChangeConflictWorker");
		worker.setScriptIncludeMethod("start");
		worker.putMethodArg("sysId", sysId);
		worker.setBackground(true);
		worker.start();

		return worker.getProgressID();
	},

	cancel: function() {
		var trackerId = this.getParameter("sysparm_tracker_id");
		if (!trackerId)
			return false;

		var execTracker = new SNC.GlideExecutionTracker(trackerId);
		execTracker.cancel(gs.getMessage("Conflict detection has been cancelled"));
	},

	deleteConflicts: function() {
		var changeSysId = this.getParameter("sysparm_sys_id") + "";
		var trackerSysId = this.getParameter("sysparm_tracker_id") + "";

		// If a more recent tracker is available, do not change conflict status or remove conflicts.
		var trackerGr = new GlideRecordSecure("sys_execution_tracker");
		trackerGr.addQuery("source", changeSysId);
		trackerGr.addQuery("name", ChangeCheckConflicts.TRACKER_NAME);
		trackerGr.orderByDesc("sys_created_on");
		trackerGr.query();
		if (trackerGr.next() && trackerSysId !== trackerGr.getUniqueValue())
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

	getTrackerRecord: function() {
		var trackerID = this.getParameter('sysparm_tracker_id');

		var trackerJSON = {};
		trackerJSON.state = 0;
		trackerJSON.percent = 0;
		trackerJSON.percent_complete = 0; //Same as 'percent' but added to match AjaxStatusProgressChecker
		trackerJSON.timestamp = new GlideDateTime().getDisplayValue();

		if (trackerID !== "") {
			var trackerGR = new GlideRecordSecure('sys_execution_tracker');

			if (trackerGR.get(trackerID)) {
				trackerJSON.state = trackerGR.getValue('state');
				trackerJSON.percent = trackerGR.getValue('percent_complete');
				trackerJSON.percent_complete = trackerGR.getValue('percent_complete');
				trackerJSON.timestamp = new GlideDateTime().getDisplayValue();
			}
		}

		return new JSON().encode(trackerJSON);
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

	type: 'ChangeConflictAJAXProcessor'
});
