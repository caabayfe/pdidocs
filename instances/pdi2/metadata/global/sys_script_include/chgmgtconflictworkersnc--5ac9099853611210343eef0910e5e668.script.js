var ChgMgtConflictWorkerSNC = Class.create();
ChgMgtConflictWorkerSNC.prototype = {

	CHG_MGT_WORKER: "chg_mgt_worker",

	initialize: function(_changeGR, _workerSysId) {
		this._changeGR = _changeGR;
		this._workerSysId = _workerSysId || null;
		this._maxProgressValue = 0;
		this._progressValue = 0;
    },

	getChangeGlideRecord: function() {
		return this._changeGR;
	},

	getWorkerSysId: function() {
		return this._workerSysId;
	},

	run: function() {
		if (!this.isTracked())
			return false;

		var worker = new GlideRecord(this.CHG_MGT_WORKER);
		if (!worker.get(this._workerSysId))
			return false;
		worker.setValue("state", "2");
		worker.setValue("percent_complete", 0);
		return worker.update();
	},

	getMaxProgressValue: function() {
		return this._maxProgressValue;
	},

	setMaxProgressValue: function(value) {
		this._maxProgressValue = value - 0;
	},

	getProgressValue: function() {
		return this._progressValue;
	},

	incrementProgressValue: function() {
		var worker = new GlideRecord(this.CHG_MGT_WORKER);
		if (!worker.get(this._workerSysId))
			return false;
		this._progressValue++;
		worker.setValue("percent_complete", ((this._progressValue / this._maxProgressValue) * 100).toFixed(2));
		return worker.update();
	},

	updateDetailMessage: function(message) {
		if (!this.isTracked())
			return false;

		if (message !== "" && !message)
			return false;

		var worker = new GlideRecord(this.CHG_MGT_WORKER);
		if (!worker.get(this._workerSysId))
			return false;
		worker.setValue("message", message);
		return worker.update();
	},

	success: function(message) {
		if (!this.isTracked())
			return false;

		var worker = new GlideRecord(this.CHG_MGT_WORKER);
		if (!worker.get(this._workerSysId))
			return false;
		worker.setValue("state", "3");
		worker.setValue("percent_complete", 100);
		if (message === "" || message)
			worker.setValue("message", message);
		return worker.update();
	},

	isCancelled: function() {
		if (!this.isTracked())
			return false;

		var worker = new GlideRecord(this.CHG_MGT_WORKER);
		if (!worker.get(this._workerSysId))
			return false;
		return "5" === worker.getValue("state");
	},

	isTracked: function() {
		return this._workerSysId !== null;
	},

	getFlowData: function() {
		var hasFlows = false;
		var hasMultipleFlows = false;
		var flowId = "";

		var workerGR = new GlideRecord(this.CHG_MGT_WORKER);
		if (!workerGR.get(this._workerSysId))
			return {hasFlows: hasFlows, hasMultipleFlows: hasMultipleFlows, flowId: flowId, flowQuery: ""};

		var flowContextGR = new GlideRecord("sys_flow_context");
		flowContextGR.addQuery("source_table", workerGR.getRecordClassName());
		flowContextGR.addQuery("source_record", workerGR.getUniqueValue());
		flowContextGR.query();
		if (flowContextGR.next()) {
			hasFlows = true;
			if (!flowContextGR.hasNext())
				flowId = flowContextGR.getUniqueValue();
			else
				hasMultipleFlows = true;
		}

		return {hasFlows: hasFlows, hasMultipleFlows: hasMultipleFlows, flowId: flowId, flowQuery: flowContextGR.getEncodedQuery()};
	},

    type: 'ChgMgtConflictWorkerSNC'
};
