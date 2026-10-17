var ChangeProcessSNC = Class.create();

ChangeProcessSNC.LOG_PROP = "com.snc.change_management.core.log";
ChangeProcessSNC.STATE_MODEL_PLUGIN = "com.snc.change_management.state_model";
ChangeProcessSNC.SHORT_DESC = "short_description";
ChangeProcessSNC.NAME = "name";
ChangeProcessSNC.NUMBER = "number";
ChangeProcessSNC.TYPE = "type";
ChangeProcessSNC.MODEL = "chg_model";
ChangeProcessSNC.STATE = "state";

ChangeProcessSNC.findAll = function(orderBy, textSearch, encodedQuery) {
	orderBy = orderBy || ChangeProcessSNC.NUMBER;
	var changeRequestGr = new GlideRecordSecure(ChangeRequest.CHANGE_REQUEST);

	if (textSearch && textSearch.trim() !== "")
		changeRequestGr.addQuery(ChangeCommon.matchAll(), textSearch);

	if (encodedQuery && encodedQuery.trim() !== "")
		changeRequestGr.addEncodedQuery(encodedQuery);

	changeRequestGr.orderBy(orderBy);
	changeRequestGr.query();
	return changeRequestGr;
};

ChangeProcessSNC.findById = function(sysId) {
	if (!sysId)
		return null;

	var changeRequestGr = new GlideRecordSecure(ChangeRequest.CHANGE_REQUEST);
	changeRequestGr.addQuery("sys_id", sysId);
	changeRequestGr.query();
	if (!changeRequestGr.next())
		return null;

	return new ChangeProcess(changeRequestGr);
};

ChangeProcessSNC.newChange = function(nameValuePairs) {
	var changeProcess = ChangeProcess.newChangeProcess(nameValuePairs);

	if (!changeProcess || !changeProcess.insert())
		return null;

	return changeProcess;
};

ChangeProcessSNC.newChangeProcess = function(nameValuePairs) {
	if (!nameValuePairs || typeof nameValuePairs !== 'object')
		return null;

	var modelSysIdOrType = nameValuePairs[ChangeProcessSNC.MODEL] || nameValuePairs[ChangeProcessSNC.TYPE];
	var newChange = ChangeRequest.newChange(modelSysIdOrType);
	if (!newChange)
		return null;

	var changeProcess = new ChangeProcess(newChange.getGlideRecord());
	var fields = changeProcess.setValues(nameValuePairs);
	if (fields.ignored && fields.ignored.length > 0)
		changeProcess.__ignoredfields = fields.ignored;

	return changeProcess;
};

ChangeProcessSNC.prototype = {

	initialize: function(_gr, _gs) {
		this._log = new GSLog(ChangeProcessSNC.LOG_PROP, this.type);

		if (this._log.atLevel(GSLog.DEBUG))
			this._log.debug("[initialize] type: " + this.type);

		this._gr = _gr || current;
		this._gs = _gs || gs;

		if (!this._gr)
			this._log.error("[initialize] invalid GlideRecord");

		this._changeRequest = null;

		if (this._gr)
			this._changeRequest = new ChangeRequest(this._gr);
	},

	resolveState: function(state) {
		state = state || this._changeRequest.getState();
		if (!state)
			return null;

		return ChangeCommon.resolveChoice(this._gr.getRecordClassName(), this._changeRequest.getStateFieldName(), state);
	},

	moveTo: function(state) {
		return this._changeRequest.moveTo(this.resolveState(state));
	},

	canMoveTo: function(state) {
		return this._changeRequest.canMoveTo(this.resolveState(state));
	},

	evaluateMoveTo: function(state) {
		return this._changeRequest.evaluateMoveTo(this.resolveState(state));
	},

	approve: function(comments) {
		return this._processApproval("approved", comments);
	},

	reject: function(comments) {
		return this._processApproval("rejected", comments);
	},

	_processApproval: function(approveReject, comments) {
		if (!approveReject)
			return false;

		// Only approvals related to Change Requests can be approved/rejected
		var tableName = this.getGlideRecord().getTableName();
		var tableNames = new TableUtils(tableName).getTables();

		if (this._log.atLevel(GSLog.DEBUG))
			this._log.debug("[_processApproval] tableName: " + tableName + " tableNames: " + tableNames);

		if (!tableNames.contains(ChangeRequest.CHANGE_REQUEST))
			return false;

		if (this._log.atLevel(GSLog.DEBUG))
			this._log.debug("[_processApproval] state: " + this._gr.state + " before: " + approveReject);

		var userSysIds = getMyApprovals();

		if (this._log.atLevel(GSLog.DEBUG))
			this._log.debug("[_processApproval] userSysIds: " + userSysIds);

		var gr = new GlideRecord("sysapproval_approver");
		gr.addQuery("approver", "IN", userSysIds);
		gr.addQuery("document_id", this._gr.getUniqueValue());
		gr.addQuery("state", "requested");
		gr.query();

		var processed = gr.hasNext();
		while (gr.next()) {
			gr.state = approveReject;
			if (comments)
				gr.comments = comments;

			if (!gr.update())
				processed = false;
		}

		// Approval/rejection may alter state of Change Request
		if (processed)
			this.refreshGlideRecord();

		if (this._log.atLevel(GSLog.DEBUG))
			this._log.debug("[_processApproval] userSysIds: " + userSysIds + " approveReject: " + approveReject + " processed: " + processed + " state: " + this._gr.state);

		return processed;
	},

	getCIs: function(type) {
		if (!this._gr || !type || (type !== ChangeCIAssociation.AFFECTED && type !== ChangeCIAssociation.IMPACTED && type !== ChangeCIAssociation.OFFERING))
			return null;

		var tableName;
		if (type.toLowerCase() === ChangeCIAssociation.AFFECTED)
			tableName = ChangeCIAssociation.TASK_CI;
		else if (type.toLowerCase() === ChangeCIAssociation.IMPACTED)
			tableName = ChangeCIAssociation.TASK_CMDB_CI_SERVICE;
		else if (type.toLowerCase() === ChangeCIAssociation.OFFERING && GlidePluginManager.isActive("com.snc.service_portfolio_core"))
			tableName = ChangeCIAssociation.TASK_SERVICE_OFFERING;
		else
			return null;

		var changeRequestSysId = this._gr.getUniqueValue();
		var gr = new GlideRecord(tableName);
		gr.addQuery("task", changeRequestSysId);
		gr.query();

		if (this._log.atLevel(GSLog.DEBUG))
			this._log.debug("[getCIs] changeRequestSysId: " + changeRequestSysId + " task count: " + gr.getRowCount());

		return gr;
	},

	getTasks: function() {
		if (!this._gr)
			return null;

		var changeRequestSysId = this._gr.getUniqueValue();
		var changeTaskGr = new GlideRecord(ChangeTask.CHANGE_TASK);
		changeTaskGr.addQuery(ChangeRequest.CHANGE_REQUEST, changeRequestSysId);
		changeTaskGr.query();

		if (this._log.atLevel(GSLog.DEBUG))
			this._log.debug("[getTasks] changeRequestSysId: " + changeRequestSysId + " task count: " + changeTaskGr.getRowCount());

		return changeTaskGr;
	},

	getChangeRequest: function() {
		return this._changeRequest;
	},

	toString: function() {
		return JSON.stringify(this.toJS());
	},

	toJS: function() {
		return ChangeCommon.toJS(this._gr);
	},

	deleteRecord: function() {
		return this._gr.canDelete() ? this._gr.deleteRecord() : false;
	},

	canWriteTo: ChangeCommon.methods.canWriteTo,
	insert: ChangeCommon.methods.insert,
	update: ChangeCommon.methods.update,
	refreshGlideRecord: ChangeCommon.methods.refreshGlideRecord,
	getGlideRecord: ChangeCommon.methods.getGlideRecord,
	setValue: ChangeCommon.methods.setValue,
	setValues: ChangeCommon.methods.setValues,
	resolveReference: ChangeCommon.methods.resolveReference,
	isReferenceField: ChangeCommon.methods.isReferenceField,

	type: "ChangeProcessSNC"
};
