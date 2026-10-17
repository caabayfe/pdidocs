var CABApprovalSNC = Class.create();

// Initialize with the task gr for which you wish to get approvals
CABApprovalSNC.prototype = Object.extendsObject(CAB, {
	
	_getTaskSysId: function() {
		return typeof this._gr === "string" ? this._gr : this._gr.getUniqueValue();
	},
	
	_getDelegators: function() {
		if (this._delegators)
			return this._delegators;
		
		this._delegators = [];
		
		// Get a list of users for which the current user is a delegate
		var delegateGr = new GlideRecord("sys_user_delegate");
		delegateGr.addQuery("delegate", this._gs.getUserID());
		delegateGr.addQuery("approvals", "true");
		delegateGr.addQuery("starts", "<=", this._gs.daysAgo(0));
		delegateGr.addQuery("ends", ">=", this._gs.daysAgo(0));
		delegateGr.query();
		
		while (delegateGr.next())
			this._delegators.push(delegateGr.user + "");
		
		if (this._log.atLevel(global.GSLog.DEBUG))
			this._log.debug("[_getDelegators] Delegator Users: " + this._delegators.join(","));
		
		return this._delegators;
	},
	
	_getApprovals: function() {
		if (this._approvals)
			return this._approvals;
		
		this._approvals = {
			"requiresApproval": false,
			"requiresUserApproval": false,
			"taskId": this._getTaskSysId(),
			"groups": [],
			"table_name": "sysapproval_approver"
		};
		
		// Initialise object by getting all approvals for task, delegated approval and user approval for task.
		var approvalGr = new GlideRecord("sysapproval_approver");
		approvalGr.addQuery('sysapproval', this._getTaskSysId()).addOrCondition("document_id",this._getTaskSysId());
		approvalGr.addQuery('state', 'requested');
		approvalGr.query();
		
		// If there are no approval records, no need to do any more 
		this._approvals.requiresApproval = approvalGr.hasNext();
		if (!this._approvals.requiresApproval) {
			this._log.debug("[init] No Approvals Required");
			return this._approvals;
		}
		
		var delegators = this._getDelegators();
		var currUsr = this._gs.getUserID();
		var apprGroups = [];
		var delegatorGroups = [];
		
		while (approvalGr.next()) {
			if (!approvalGr.canRead())
				continue;
			
			var appUsr = approvalGr.approver + "";
			
			if (appUsr === currUsr) {
				this._approvals.requiresUserApproval = true;
				
				if (!approvalGr.group.nil())
					apprGroups.push(approvalGr.group + "");
				continue;
			}
			
			if (delegators.indexOf(appUsr) !== -1) {
				this._approvals.requiresUserApproval = true;
				
				var delegatorGroup = approvalGr.group + "";
				if (!approvalGr.group.nil() && apprGroups.indexOf(delegatorGroup) === -1)
					delegatorGroups.push(delegatorGroup);
			}
		}
		
		var allGroups = apprGroups.concat(delegatorGroups);
		if (allGroups.length === 0) {
			if (this._log.atLevel(global.GSLog.DEBUG))
				this._log.debug("[init] No Group Approvals Required: " + JSON.stringify(this._approvals, null, 3));
			return this._approvals;
		}
		
		// Get the user Groups related to the Approval Groups
		var sysAppGrpGr = new GlideRecord("sysapproval_group");
		sysAppGrpGr.addQuery("sys_id","IN",allGroups.join(","));
		sysAppGrpGr.query();
		
		var groupApproval = null;
		var groupsIdx = {};
		while (sysAppGrpGr.next()) {
			var sysAppGrpId = sysAppGrpGr.getUniqueValue();
			
			// Direct approvals
			if (apprGroups.indexOf(sysAppGrpId) > -1) {
				if (groupsIdx[sysAppGrpId]) {
					groupsIdx[sysAppGrpId].delegated = false;
					continue;
				}
				
				groupApproval = {
					"sys_id": sysAppGrpId,
					"display_value": sysAppGrpGr.getDisplayValue("assignment_group"),
					"delegated": false
				};
				
				this._approvals.groups.push(groupApproval);
				groupsIdx[sysAppGrpId] = groupApproval;
				continue;
			}
			
			//Delegated approvals
			if (delegatorGroups.indexOf(sysAppGrpId) > -1) {
				if (groupsIdx[sysAppGrpId])
					continue;
				
				groupApproval = {
					"sys_id": sysAppGrpId,
					"display_value": sysAppGrpGr.getDisplayValue("assignment_group"),
					"delegated": true
				};
				
				this._approvals.groups.push(groupApproval);
				groupsIdx[sysAppGrpId] = groupApproval;
			}
		}
		
		if (this._log.atLevel(global.GSLog.DEBUG))
			this._log.debug("[init] Approval Info: " + JSON.stringify(this._approvalInfo, null, 3));
		
		return this._approvals;
	},
	
	initialize: function(_taskGr, _gs) {
		CAB.prototype.initialize.call(this, _taskGr, _gs);
	},
	
	requiresApproval: function() {
		return this._getApprovals().requiresApproval;
	},
	
	requiresUserApproval: function() {
		return this._getApprovals().requiresUserApproval;
	},
	
	// Gets an approval record which the current user can approve/reject
	getApprovalRecord: function(approvalGroupId) {
		
		var currUsr = this._gs.getUserID();
		//try to get the approval for the current user including group if it exists
		var approvalRecord = new GlideRecord("sysapproval_approver");
		approvalRecord.addQuery("sysapproval", this._getTaskSysId()).addOrCondition("document_id",this._getTaskSysId());
		approvalRecord.addQuery("state", "requested");
		approvalRecord.addQuery("approver",currUsr);
		if (approvalGroupId)
			approvalRecord.addQuery("group", approvalGroupId);
		approvalRecord.query();
		
		if (approvalRecord.next())
			return approvalRecord;
		
		// No record, check the delegates
		var delegators = this._getDelegators();
		approvalRecord = new GlideRecord("sysapproval_approver");
		approvalRecord.addQuery("sysapproval", this._getTaskSysId()).addOrCondition("document_id",this._getTaskSysId());
		approvalRecord.addQuery("state", "requested");
		approvalRecord.addQuery("approver","IN",delegators.join(","));
		if (approvalGroupId)
			approvalRecord.addQuery("group", approvalGroupId);
		approvalRecord.query();
		
		if (approvalRecord.next())
			return approvalRecord;
		
		return null;
		
	},
	
	setApprove: function(comment, approvalGroupId) {		
		var approvalGr = this.getApprovalRecord(approvalGroupId);
		if (approvalGr === null)
			return false;
		
		approvalGr.comments = comment;
		approvalGr.state = "approved";
		return approvalGr;
	},
	
	approve: function(comment, approvalGroupId) {		
		var approvalGr = this.setApprove(comment, approvalGroupId);
		if (approvalGr === false)
			return false;

		// set authenticated session prop for e-signature
		gs.getSession().putClientData("auhorised_" + approvalGr.getUniqueValue(), "authorised");

		if (this._log.atLevel(global.GSLog.DEBUG))
			this._log.debug("[approve] Approving: \n" + JSON.stringify(this._toJS(approvalGr), null, 3));
		
		return approvalGr.update();
	},
	
	setReject: function(comment, approvalGroupId) {
		var approvalGr = this.getApprovalRecord(approvalGroupId);
		if (approvalGr === null)
			return null;
		
		approvalGr.comments = comment;
		approvalGr.state = "rejected";
		return approvalGr;
	},
	
	reject: function(comment, approvalGroupId) {
		var approvalGr = this.setReject(comment, approvalGroupId);
		if (approvalGr === null)
			return false;

		// set authenticated session prop for e-signature
		gs.getSession().putClientData("auhorised_" + approvalGr.getUniqueValue(), "authorised");

		if (this._log.atLevel(global.GSLog.DEBUG))
			this._log.debug("[reject] Rejecting: \n" + JSON.stringify(this._toJS(approvalGr), null, 3));
		
		return approvalGr.update();
	},
	
	// Output the approvals object required by CAB
	toJS: function() {
		return this._getApprovals();
	},

    type: 'CABApprovalSNC'
});
