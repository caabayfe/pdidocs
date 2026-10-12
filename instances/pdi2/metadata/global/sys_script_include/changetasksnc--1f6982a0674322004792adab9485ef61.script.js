var ChangeTaskSNC = Class.create();

ChangeTaskSNC.ENFORCE_DATA_REQ_PROP = "com.snc.change_management.enforce_data_requirements";

ChangeTaskSNC.prototype = {
    initialize: function (changeTaskGr) {
        this._log = new GSLog(ChangeCommon.LOG_PROPERTY, this.type);
        this._gr = changeTaskGr;

        this.plugin = {
            "change_management": pm.isActive("com.snc.change_management")
        };

        this.api = (this.plugin.change_management) ? this.api = new ChangeTaskChgManagementAPI(changeTaskGr) : new ChangeTaskChgRequestAPI(changeTaskGr);
    },

    // Returns the appropriate API to use for the given change task
    _getAPI: function () {
        return this.api;
    },

    /**
     * Checks whether a change task state is Pending
     */
    isPending: function () {
        return this._getAPI().isPending();
    },

    /**
     * Checks whether the field in the record has changed to the Pending state
     */
    changesToPending: function () {
        return this._getAPI().changesToPending();
    },

    /**
     * Set the record's state to Pending but the record is not saved.
     */
    setPending: function () {
        this._getAPI().setPending();
    },

    /**
     * Change the state of the change task to Pending (the record is saved)
     */
    pending: function () {
        return this._getAPI().pending();
    },

    /**
     * Checks whether a change task state is Open
     */
    isOpen: function () {
        return this._getAPI().isOpen();
    },

    /**
     * Checks whether the field in the record has changed to the Open state
     */
    changesToOpen: function () {
        return this._getAPI().changesToOpen();
    },

    /**
     * Set the record's state to Open but the record is not saved.
     */
    setOpen: function () {
        this._getAPI().setOpen();
    },

    /**
     * Change the state of the change task to Open (the record is saved)
     */
    open: function () {
        return this._getAPI().open();
    },

    /**
     * Checks whether a change task is in progress
     */
    isInProgress: function () {
        return this._getAPI().isInProgress();
    },

    /**
     * Checks whether the field in the record has changed to the In Progress state
     */
    changesToInProgress: function () {
        return this._getAPI().changesToInProgress();
    },

    /**
     * Set the record's state to In Progress but the record is not saved.
     */
    setInProgress: function () {
        this._getAPI().setInProgress();
    },

    /**
     * Change the state of the change task to In Progress (the record is saved)
     */
    inProgress: function () {
        return this._getAPI().inProgress();
    },

    /**
     * Checks whether a change task has been closed
     */
    isClosed: function () {
        return this._getAPI().isClosed();
    },

    /**
     * Checks whether the change task has been set to Closed + Successful state
     */
    isClosedSuccessful: function () {
        return this._getAPI().isClosedSuccessful();
    },

    /**
     * Checks whether the change task has been set to Closed + Successful with issues state
     */
    isClosedSuccessfulWithIssues: function () {
        return this._getAPI().isClosedSuccessfulWithIssues();
    },

    /**
     * Checks whether the change task has been set to Closed + Unsuccessful state
     */
    isClosedUnsuccessful: function () {
        return this._getAPI().isClosedUnsuccessful();
    },

    /**
     * Checks whether the field in the record has changed to the Closed state
     */
    changesToClosed: function () {
        return this._getAPI().changesToClosed();
    },

    /**
     * Set the record's state to closed according to the close code, but the record is not saved.
     */
    setClose: function (closeCode, closeNotes) {
        return this._getAPI().setClose(closeCode, closeNotes);
    },

    /**
     * Set close notes for the change task, but not save the record
     */
    setCloseNotes: function (closeNotes) {
        this._getAPI().setCloseNotes(closeNotes);
    },

    /**
     * Change the state of the change task to Closed (the record is saved) with the specified close code and close notes
     */
    close: function (closeCode, closeNotes) {
        return this._getAPI().close(closeCode, closeNotes);
    },

    /**
     * Change the state of the change task to Closed + Successful with the specified close notes without saving the record
     */
    setCloseSuccessful: function (closeNotes) {
        this._getAPI().setCloseSuccessful();
    },

    /**
     * Change the state of the change task to Closed + Successful (the record is saved) with the specified close notes
     */
    closeSuccessful: function (closeNotes) {
        return this._getAPI().closeSuccessful(closeNotes);
    },

    /**
     * Change the state of the change task to Closed + Successful with issues and the specified close notes without saving the record
     */
    setCloseSuccessfulWithIssues: function (closeNotes) {
        this._getAPI().setCloseSuccessfulWithIssues(closeNotes);
    },

    /**
     * Change the state of the change task to Closed + Successful with issues (the record is saved) with the specified close notes
     */
    closeSuccessfulWithIssues: function (closeNotes) {
        return this._getAPI().closeSuccessfulWithIssues(closeNotes);
    },

    /**
     * Change the state of the change task to Closed + Unsuccessful with the specified close notes without saving the record
     */
    setCloseUnsuccessful: function (closeNotes) {
        return this._getAPI().setCloseUnsuccessful(closeNotes);
    },

    /**
     * Change the state of the change task to Closed + Unsuccessful (the record is saved) with the specified close notes
     */
    closeUnsuccessful: function (closeNotes) {
        return this._getAPI().closeUnsuccessful(closeNotes);
    },

    /**
     * Checks whether a change task is canceled
     */
    isCanceled: function () {
        return this._getAPI().isCanceled();
    },

    /**
     * Checks whether the field in the record has changed to the Canceled state
     */
    changesToCanceled: function () {
        return this._getAPI().changesToCanceled();
    },

    /**
     * Set the record's state to cancelled but the record is not saved.
     */
    setCancel: function (closeNotes) {
        return this._getAPI().setCancel(closeNotes);
    },

    /**
     * Change the state of the change task to Canceled (the record is saved)
     */
    cancel: function (closeNotes) {
        return this._getAPI().cancel(closeNotes);
    },

    _insertUpdate: function () {
        return this._getAPI()._insertUpdate();
    },

    getValue: function (name) {
        return this._getAPI().getValue(name);
    },

    isOnHold: function () {
        return this._getAPI().isOnHold();
    },

    setOnHoldReason: function (holdReason) {
        this._getAPI().setOnHoldReason(holdReason);
    },

    setOnHold: function (holdValue) {
        this._getAPI().setOnHold(holdValue);
    },

    onHold: function (holdValue, holdReason) {
        return this._getAPI().onHold(holdValue, holdReason);
    },

    onHoldReason: function (newValue) {
        return this._getAPI().onHoldReason(newValue);
    },

    clearOnHold: function () {
        return this._getAPI().clearOnHold();
    },

    toString: function () {
        return JSON.stringify(this.toJS());
    },

    toJS: function () {
        return ChangeCommon.toJS(this._gr);
    },

    insert: ChangeCommon.methods.insert,

    update: ChangeCommon.methods.update,

    deleteRecord: ChangeCommon.methods.deleteRecord,

    refreshGlideRecord: ChangeCommon.methods.refreshGlideRecord,

    getGlideRecord: ChangeCommon.methods.getGlideRecord,

    setValue: ChangeCommon.methods.setValue,

    setValues: ChangeCommon.methods.setValues,

    canWriteTo: ChangeCommon.methods.canWriteTo,

    resolveChoice: ChangeCommon.methods.resolveChoice,

    resolveReference: ChangeCommon.methods.resolveReference,

    isReferenceField: ChangeCommon.methods.isReferenceField,

    type: 'ChangeTaskSNC'
};

ChangeTaskSNC.newChangeTask = function(nameValuePairs) {
	var changeTaskGr = new GlideRecord(ChangeTask.CHANGE_TASK);
	changeTaskGr.initialize();
	changeTaskGr.setValue("state", ChangeTask.DEFAULT_STATE);
	var changeTask = new ChangeTask(changeTaskGr);
	if (nameValuePairs) {
		if (!nameValuePairs.hasOwnProperty("change_request"))
			return null;
		changeTask.setValues(nameValuePairs);
		if (!changeTask.insert())
			return null;
	}
	return changeTask;
};
ChangeTaskSNC.bySysId = function(sysId) {
	if (!sysId)
		return null;
	var changeTaskGr = new GlideRecord(ChangeTask.CHANGE_TASK);
	changeTaskGr.addQuery("sys_id", sysId);
	changeTaskGr.query();
	if (!changeTaskGr.next())
		return null;
	return new ChangeTask(changeTaskGr);
};
ChangeTaskSNC.hasOnHoldField = function() {
	return GlideTableDescriptor.get('change_task').isValidField('on_hold');
};
