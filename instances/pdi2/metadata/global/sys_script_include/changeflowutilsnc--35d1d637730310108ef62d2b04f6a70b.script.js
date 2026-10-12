var ChangeFlowUtilSNC = Class.create();
ChangeFlowUtilSNC.prototype = {

	CANCELED: "4",
	CHANGE_MODEL_EVALUATE: "change_model.evaluate",
	NOT_REQUIRED: "not_required",
	NOT_REQUESTED: "not requested",
	OPEN: "1",
	PENDING: "-5",
	REQUESTED: "requested",
	STATE: "state",

	initialize: function(changeRequestGR, _gs) {
		this.changeRequestGR = changeRequestGR;
		this._gs = _gs || gs;
	},

	getFlowData: function() {
		var hasFlows = false;
		var hasMultipleFlows = false;
		var flowId = "";

		if (!this.changeRequestGR || !this.changeRequestGR.isValidRecord())
			return {hasFlows: hasFlows, hasMultipleFlows: hasMultipleFlows, flowId: flowId, flowQuery: ""};

		var flowContextGR = new GlideRecord("sys_flow_context");
		flowContextGR.addQuery("source_table", this.changeRequestGR.getRecordClassName());
		flowContextGR.addQuery("source_record", this.changeRequestGR.getUniqueValue());
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

	cancelChangeTasks: function() {
		if (!this.changeRequestGR || !this.changeRequestGR.isValidRecord())
			return;
		var changeTasksGR = new GlideRecord("change_task");
		changeTasksGR.addQuery("change_request", this.changeRequestGR.getUniqueValue());
		changeTasksGR.addQuery("created_from", "flow");
		changeTasksGR.addQuery(this.STATE, [this.OPEN, this.PENDING]);
		changeTasksGR.setValue(this.STATE, this.CANCELED);
		changeTasksGR.updateMultiple();
	},

	disregardApprovals: function() {
		if (!this.changeRequestGR || !this.changeRequestGR.isValidRecord())
			return;

		var changeGR = new GlideRecord(this.changeRequestGR.getRecordClassName());
		if (!changeGR.get(this.changeRequestGR.getUniqueValue()))
			return;

		var approvalUtils = new WorkflowApprovalUtils();
		var comment = "";
		if ("1" === changeGR.getValue("on_hold"))
			comment = gs.getMessage("Approvals are no longer required as the change request is on hold.");
		var changeRequestSysId = changeGR.getUniqueValue();
		approvalUtils.setGroupApprovalsByTask(changeRequestSysId, this.NOT_REQUIRED, "", [this.NOT_REQUESTED, this.REQUESTED]);
		approvalUtils.setUserApprovalsByTask(changeRequestSysId, this.NOT_REQUIRED, comment, [this.NOT_REQUESTED, this.REQUESTED]);

		if (comment)
			changeGR.approval_history = comment;
		changeGR.setValue("approval", this.NOT_REQUESTED);
		changeGR.update();
	},
	
	evaluateChangeModel: function() {
		if (!this.changeRequestGR || !this.changeRequestGR.isValidRecord())
			return;

		var changeGR = new GlideRecord(this.changeRequestGR.getRecordClassName());
		if (!changeGR.get(this.changeRequestGR.getUniqueValue()) || changeGR.chg_model.nil())
			return;

		var changeModel = new ChangeModel(changeGR.chg_model.getRefRecord());
		if (changeModel.applyAutomaticTransition(changeGR))
			changeGR.update();
	},

	hasUserApprovedLatestApproval: function(sysUserGR) {
		if (!this.changeRequestGR || !this.changeRequestGR.isValidRecord() || !sysUserGR || !sysUserGR.isValidRecord())
			return false;

		var grApproval = new GlideRecord("sysapproval_approver");
		grApproval.addQuery("document_id", this.changeRequestGR.getUniqueValue());
		grApproval.addQuery("approver", sysUserGR.getUniqueValue());
		grApproval.orderByDesc("sys_created_on");
		grApproval.query();

		return grApproval.next() && grApproval.getValue(this.STATE) === "approved";
	},

	type: 'ChangeFlowUtilSNC'
};
