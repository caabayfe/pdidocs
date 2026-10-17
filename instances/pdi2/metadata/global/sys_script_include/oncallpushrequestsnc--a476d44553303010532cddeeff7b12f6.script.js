var OnCallPushRequestSNC = Class.create();
OnCallPushRequestSNC.prototype = {

	initialize: function() {
		this._log = new GSLog('com.snc.on_call_rotation.log.level', this.type);
	},

	// TABLE
	ON_CALL_PUSH_REQUEST: 'on_call_push_request',

	// FIELDS
	ACCEPTOR: 'acceptor',
	SOURCE_TABLE: 'source_table',
	DOCUMENT_ID: 'document_id',
	STATE: 'state',
	ACTIVE: 'active',
	ITERATION: 'iteration',

	REQUESTED: 'requested',
	NOT_REQUIRED: 'not_required',

	createOrUpdatePush: function(userSysId, sourceTable, documentID) {
		userSysId = userSysId || this._userSysId;
		sourceTable = sourceTable || this._sourceTable;
		documentID = documentID || this._documentID;

		if (this._log.atLevel(GSLog.DEBUG))
			this._log.logDebug('[createOrUpdatePush] userSysId: ' + userSysId + ' sourceTable: ' + sourceTable + ' documentID: ' + documentID);

		if (JSUtil.nil(userSysId) || JSUtil.nil(sourceTable) || JSUtil.nil(documentID))
			return this;

		var sysId = '';
		var gr = new GlideRecord(this.ON_CALL_PUSH_REQUEST);
		gr.addActiveQuery();
		gr.addQuery(this.ACCEPTOR, userSysId);
		gr.addQuery(this.SOURCE_TABLE, sourceTable);
		gr.addQuery(this.DOCUMENT_ID, documentID);
		gr.addQuery(this.STATE, this.REQUESTED);
		gr.query();
		if (gr.next()) {
			var iteration = parseInt(gr.getValue('iteration'));
			iteration = isNaN(iteration) ? 1 : iteration + 1;
			gr.setValue('iteration', iteration);
			sysId = gr.update();
		} else {
			gr.initialize();
			gr.setValue(this.ACCEPTOR, userSysId);
			gr.setValue(this.SOURCE_TABLE, sourceTable);
			gr.setValue(this.DOCUMENT_ID, documentID);
			gr.setValue(this.STATE, this.REQUESTED);
			sysId = gr.insert();
		}

		if (this._log.atLevel(GSLog.DEBUG))
			this._log.logDebug('[createOrUpdatePush] sysId: ' + sysId);

		return this;
	},

	expireMobileNotifications: function(userSysId, sourceTable, documentID) {
		userSysId = userSysId || this._userSysId;
		sourceTable = sourceTable || this._sourceTable;
		documentID = documentID || this._documentID;

		if (this._log.atLevel(GSLog.DEBUG))
			this._log.logDebug('[expireMobileNotifications] userSysId: ' + userSysId + ' sourceTable: ' + sourceTable + ' documentID: ' + documentID);

		if (JSUtil.nil(userSysId) || JSUtil.nil(sourceTable) || JSUtil.nil(documentID))
			return this;

		// Expire notifications that are no longer required
		var notRequiredGr = new GlideRecord(this.ON_CALL_PUSH_REQUEST);
		notRequiredGr.addActiveQuery();
		notRequiredGr.addQuery(this.ACCEPTOR, '!=', userSysId);
		notRequiredGr.addQuery(this.SOURCE_TABLE, sourceTable);
		notRequiredGr.addQuery(this.DOCUMENT_ID, documentID);
		notRequiredGr.addQuery(this.STATE, this.REQUESTED);
		notRequiredGr.query();
		notRequiredGr.setValue(this.STATE, this.NOT_REQUIRED);
		notRequiredGr.setValue(this.ACTIVE, false);
		notRequiredGr.updateMultiple();

		// Deactivated all notifications on acceptance
		var activeNotifGr = new GlideRecord(this.ON_CALL_PUSH_REQUEST);
		activeNotifGr.addActiveQuery();
		activeNotifGr.addQuery(this.SOURCE_TABLE, sourceTable);
		activeNotifGr.addQuery(this.DOCUMENT_ID, documentID);
		activeNotifGr.query();
		activeNotifGr.setValue(this.ACTIVE, false);
		activeNotifGr.updateMultiple();

		return this;
	},

	setUserSysId: function(userSysId) {
		this._userSysId = userSysId;
		return this;
	},

	setSourceTable: function(sourceTable) {
		this._sourceTable = sourceTable;
		return this;
	},

	setDocumentID: function(documentID) {
		this._documentID = documentID;
		return this;
	},

    type: 'OnCallPushRequestSNC'
};
