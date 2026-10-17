var CMDBWsDMTaskUIProxy = Class.create();
CMDBWsDMTaskUIProxy.prototype = {
    /**
     * This class will have all methods that UI Data broker will call.
     * Rather than directly calling any backend script include, UI broker will only call method exposed via Proxy Class. 
     * This way we can decouple the backend script include changes, like method signature changes, without impacting UI.
     * Also it would be simple to find out all backend methods exposed to UI.
     */
    _taskMgr: undefined,

    initialize: function() {
        this._taskMgr = new CMDBWsDMTaskManager();
    },

    getPolicyTypeForTask: function(taskId) {
        return this._taskMgr.getPolicyTypeForTask(taskId);
    },

    getTaskToCiTableName: function(taskId) {
        return this._taskMgr.getTaskToCiTable(taskId);
    },

    /**
     * Cancel Task
     * @param {*} taskId
     * @param {*} comment
     * */
    cancelTask: function(taskId, comment) {
        return this._taskMgr.cancelTask(taskId, comment);
    },

	/**
     * Reject Task
     * @param {*} taskSysId
     * @param {*} rejectionReason
     * */
    rejectTask: function(taskSysId, rejectionReason) {
        return this._taskMgr.rejectTask(taskSysId, rejectionReason);
    },

    /**
     * Reassign Task to new user
     * @param {*} taskId
     * @param {*} userId
     * */
    reassignTask: function(taskId, assignmentGroupId, userId, comment) {
        return this._taskMgr.reassignTask(taskId, assignmentGroupId, userId, comment);
    },

    /**
     * Assign Task to current user
     * @param {*} taskId
     * */
    assignToCurrentUser: function(taskId) {
        return this._taskMgr.assignToCurrentUser(taskId);
    },

    /**
     * Get percentage complete
     * @param {*} taskId
     * */
    getPercentageComplete: function(taskId) {
        return this._taskMgr.getPercentageComplete(taskId);
    },

    /**
     * Certify records
     * @param {*} taskId
     * @param {*} selectionObject
     * */
    certifyRecords: function(taskId, selectionObject) {
        return this._taskMgr.certifyRecords(taskId, selectionObject);
    },

    /**
     * Fail records
     * @param {*} taskId
     * @param {*} selectionObject
     * */
    failRecords: function(taskId, selectionObject) {
        return this._taskMgr.failRecords(taskId, selectionObject);
    },
	
    /**
     * Save records comment on a certification task
     * @param {*} taskId  
     * @param {*} comment
     * @param {*} selectionObject
     */
	saveRecordsComment: function(taskId, comment, selectionObject) {
		return this._taskMgr.saveRecordsComment(taskId, comment, selectionObject);
	},

    /**
     * Get attributes status for certification task
     * @param {*} taskId
     * @param {*} documentSysIds
     * */
    getAttributeStatusAndComment: function(taskId, documentSysIds) {
        return this._taskMgr.getAttributeStatusAndComment(taskId, documentSysIds);
    },

    /**
     * Certify attributes on a certification task
     * @param {*} taskId 
     * @param {*} comment
     * @param {*} selectionObject 
     */
    certifyAttributes: function(taskId, attributes, comment, selectionObject) {
        return this._taskMgr.certifyAttributes(taskId, attributes, comment, selectionObject);
    },

    /**
     * Fail attributes on a certification task
     * @param {*} taskId  
     * @param {*} comment
     * @param {*} selectionObject
     */
    failAttributes: function(taskId, attributes, comment, selectionObject) {
        return this._taskMgr.failAttributes(taskId, attributes, comment, selectionObject);
    },

    /**
     * Save attribute comment on a certification task
     * @param {*} taskId  
     * @param {*} comment
     * @param {*} selectionObject
     */
	saveAttributesComment: function(taskId, attributes, comment, selectionObject) {
		return this._taskMgr.saveAttributesComment(taskId, attributes, comment, selectionObject);
	},

    /**
     * Save updated attribute values on a certification task
     * @param {*} taskId 
     * @param {*} docSysIdToAttributeValues 
     * @param {*} comment 
     */
    saveAttributes: function(taskId, docSysIdToAttributeValues, comment) {
        return this._taskMgr.saveAttributes(taskId, docSysIdToAttributeValues, comment);
    },

    getTaskRecordSummary: function(taskId) {
        return this._taskMgr.getTaskRecordSummary(taskId);
    },

    /**
     * Validates whether the current user is assigned to the task or belongs to the group assigned to the task
     */
    validateTaskAssignmentToCurrentUser: function(taskId) {
        return this._taskMgr.validateTaskAssignmentToCurrentUser(taskId);
    },

    /**
    * Approves the given lifecycle task 
    * Sets the state of corresponding sysapproval_approver record to "approved"
    */
    approveLifeCycleTask: function(taskId) {
        return this._taskMgr.approveLifeCycleTask(taskId);
    },

    getTaskAssignmentFilterQuery: function() {
        return this._taskMgr.getTaskAssignmentFilterQuery();
    },

    submitCertificationTask: function(taskId) {
        return this._taskMgr.submitCertificationTask(taskId);
    },

    type: 'CMDBWsDMTaskUIProxy'
};
