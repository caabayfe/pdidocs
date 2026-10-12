/**
 * The Approval Coordinator watches group and user child approval activities.
 */
/* global WFActivityHandler, WorkflowApprovalUtils, workflow, activity, current, gs, GlideRecord */
/* eslint-disable strict, eqeqeq, dot-notation, quotes */
var Approval_CoordinatorActivityHandler = Class.create();
Approval_CoordinatorActivityHandler.prototype = Object.extendsObject(WFActivityHandler, {

	DETERMINE_APPROVAL_STATE_EVENT: "determineApprovalState",

	initialize: function() {
		WFActivityHandler.prototype.initialize.call(this);
		this.approvalUtils = new WorkflowApprovalUtils();
	},

	onExecute: function() {
		var approvalIds = this._removeGroupDuplicates();
		this.approvalUtils.setGroupApprovalsByIds(approvalIds, 'requested', '', [ 'not requested', 'rejected', 'not_required' ]);
		approvalIds = this._removeUserDuplicates();
		this.approvalUtils.setUserApprovalsByIds(approvalIds, 'requested', '', [ 'not requested', 'rejected', 'not_required' ]);

		activity.state = 'waiting';
		// only now that we have all of our child approvals created can we ask the children
		// to determine their state, and subsequently our state.  We have to do this AFTER
		// all of the children have created their approvals since we handle the duplicate removals
		// and removing duplicates can impact their approval state.
		workflow.registerForEvent(this.DETERMINE_APPROVAL_STATE_EVENT);
		workflow.fireEvent(this.DETERMINE_APPROVAL_STATE_EVENT);
		workflow.unregisterForEvent(this.DETERMINE_APPROVAL_STATE_EVENT);
	},

	onDetermineApprovalState: function() {
		// our children have finished, determine our overall state now
		this.determineState();
	},

	// See if we are done
	onUpdate: function() {
		this.determineState();
	},

	/**
	 * Create the approvals as a forward-looking process in which we just create, but do not
	 * process the approvals. This allows the approvals to be generated up front before the
	 * workflow runs such that the approvals are visible prior to being requested.
	 */
	_generate: function(approvalOrder, startAt, noCreateFlag) {
		if (noCreateFlag)
			return;

		this._removeGroupDuplicates();
		this._removeUserDuplicates();
	},

	determineState: function() {
		if (current.approval == 'cancelled') {
			activity.state = 'finished';
			activity.result = 'cancelled';
			return;
		}

		var state = this._determineOverallState();
		if (state == 'skipped') {
			activity.state = 'finished';
			activity.result = state;
		} else if ((state == 'approved') || (state == 'rejected')) {
			var ids = this._getAMGroupApprovalIds();
			if (ids.length > 0)
				this.approvalUtils.setPendingGroupApprovalsByIds(ids, 'not_required');

			ids = this._getAMUserApprovalIds();
			if (ids.length > 0)
				this.approvalUtils.setPendingUserApprovalsByIds(ids, 'not_required');

			activity.state = 'finished';
			activity.result = state;
		}
	},

	// The approval coordinator was cancelled
	onCancel: function() {
		var ids = this._getAMGroupApprovalIds();
		if (ids.length > 0)
			this.approvalUtils.setPendingGroupApprovalsByIds(ids, 'cancelled');

		ids = this._getAMUserApprovalIds();
		if (ids.length > 0)
			this.approvalUtils.setPendingUserApprovalsByIds(ids, 'cancelled');

		activity.state = 'cancelled';
		activity.result = 'cancelled';
	},

	// Determine the overall state of the approvals (approved, rejected or '')
	_determineOverallState: function() {
		var counts = this._getChildTaskResults();
		var waitFor = activity.vars.wait_for;
		if (waitFor == 'script') {
			if (!activity.vars.approval_script)
				return 'approved';

			// Set up information to be passed to the script
			// overall counts
			workflow.prepareScriptVariable('counts', counts);
			var state = this.runScript(activity.vars.approval_script);
			workflow.removeScriptVariable('counts');
			return state;
		}

		// Overall state
		var rejectHandling = activity.vars.reject_handling;
		if (counts['total'] == 0)
			return 'skipped';

		if ((counts['rejected'] > 0) && (rejectHandling == 'reject'))
			return 'rejected';

		if ((waitFor == 'any' || waitFor == 'first_any') && (counts['approved'] > 0))
			return 'approved';

		if ((waitFor == 'first_any') && (counts['rejected'] > 0))
			return 'rejected';

		if ((waitFor == 'all') && (counts['approved'] == counts['total']))
			return 'approved';

		if ((counts['rejected'] + counts['approved']) == counts['total'])
			return 'rejected'; // we are complete - we have to make a decision

		return '';
	},

	_getAMGroupApprovalIds: function() {
		var ids = [];
		var approvals = this.approvalUtils.getGroupApprovalsByApprovalManager(current.sys_id, activity.activity.sys_id);
		for (var id in approvals)
			ids.push(id);

		return ids;
	},

	_getAMUserApprovalIds: function() {
		var ids = [];
		var approvals = this.approvalUtils.getUserApprovalsByApprovalManager(current.sys_id, activity.activity.sys_id);
		for (var id in approvals)
			ids.push(id);

		return ids;
	},

	_getChildTaskResults: function() {
		var counts = {
			total: 0,
			requested: 0,
			approved: 0,
			rejected: 0,
			cancelled: 0
		};

		var children = new GlideRecord('wf_executing');
		children.addQuery('parent', activity.sys_id);
		children.query();
		while (children.next()) {
			this._restartManualApprovals(children);
			var state = children.result.toString();
			if (state == 'skipped')
				continue;

			if (!state)
				state = 'requested';
			else
				state = state.replace(/\s/g, "_");

			if (!counts[state])
				counts[state] = 0;

			counts[state] = counts[state] + 1;
			if (state == 'approved' || state == 'requested' || state == 'rejected')
				counts.total++;
		}

		if (gs.getProperty('glide.workflow_approval_utils.log') == 'true') {
			var debugString = "Approvals for: " + activity.name;
			for ( var s in counts)
				debugString += " " + s + "=" + counts[s];
			this.debug(debugString);
		}
		return counts;
	},
	
	// PRB1115684: There was a bug that allowed a Manual Approval activity to 
	// restart after an update when contained in an executing Approval Coordinator
	// Added property to preserve the behavior for existing customers
	_restartManualApprovals: function(child) {
	    if (gs.getProperty('glide.manual.approval.pickup_on_update', "false") == "false")
			return;

		if (event == this.DETERMINE_APPROVAL_STATE_EVENT)
			return;
		
		if (child.activity.activity_definition.name != 'Manual Approvals')
			return;

		if (child.state == 'waiting')
			return;

		child.state = 'waiting';
		child.result = '';
		child.setWorkflow(false);
		child.update();

		// only now that we have all of our child approvals created can we ask the manual children
		// to determine their state, and subsequently our state.  We have to do this AFTER
		// any new manual approvals might get created.
		workflow.registerForEvent(this.DETERMINE_APPROVAL_STATE_EVENT);
		workflow.fireEvent(this.DETERMINE_APPROVAL_STATE_EVENT);
		workflow.unregisterForEvent(this.DETERMINE_APPROVAL_STATE_EVENT);
	},

	// Remove any groups that are referenced more than one time (so that we only ask for that
	// group approval once)
	_removeGroupDuplicates: function() {
		var gr = new GlideRecord('sysapproval_group');
		var approvalIds = [];

		// handles group approval
		var approvals = this.approvalUtils.getGroupApprovalsByApprovalManager(current.sys_id, activity.activity.sys_id);
		approvalIds = approvalIds.concat(this._removeDuplicates(gr, approvals, false));

		return approvalIds;
	},

	// Remove any users that are referenced more than one time (so that we only ask for that
	// user approval once)
	_removeUserDuplicates: function() {
		var gr = new GlideRecord('sysapproval_approver');
		var approvalIds = [];

		// handles user approval
		var approvals = this.approvalUtils.getUserApprovalsByApprovalManager(current.sys_id, activity.activity.sys_id);
		approvalIds = approvalIds.concat(this._removeDuplicates(gr, approvals, true));

		return approvalIds;
	},

	/**
	 * removes approval duplicates.
	 * if it is user approval, then isUserApproval should be true, otherwise false.
	 */
	_removeDuplicates: function(gr, approvals, isUserApproval) {
		var deDup = "true" == gs.getProperty('glide.workflow.approval.remove_duplicates','false');

		var approvalIds = [];
		var approverObject = {};
		var approvalObjects = {};
		var approverId = null;
		for (var id in approvals) {
			var info = approvals[id];
			if (info.state == 'cancelled' || info.state == 'not_required')
				continue;

			if ( gs.getProperty('glide.workflow.approval.readd_approved_rejected', 'false') == 'true')
				if (info.state == 'approved' || info.state == 'rejected')
					continue;

			approverId = info.approver_id;
			/* eslint-disable curly */
			// We must remove duplicate groups as legacy behavior, but we should only remove duplicate users when explicitly instructed to
			if ((deDup || !isUserApproval) && approverObject[approverId]) {
				if (gr.get(id)) {
					if (isUserApproval)
						this.approvalUtils.addApprovalHistoryGR(current, gs.getMessage("Duplicate user approval removed for {0}.", [ gr.approver.name
								.toString() ]));
					else
						this.approvalUtils.addApprovalHistoryGR(current, gs.getMessage("Duplicate group approval removed for {0}.", [ gr.assignment_group.name
								.toString() ]));


					// Before we delete we need to ensure the other Approval Activities watch for the remaining
					// Sysapproval record to be approved/rejected.  Don't update if we simply removed a duplicate group.
					if (isUserApproval && deDup)
						this._updateApprovalIDs(id, approvalObjects[approverId], info.activity_id);
					if (!isUserApproval && deDup)
						this._updateGroupApprovalIDs(id, approvalObjects[approverId], info.activity_id, approvals[approvalObjects[approverId]].activity_id);

					gr.setWorkflow(false);
					gr.deleteRecord();
				}
			} else {
				approverObject[approverId] = true;
				approvalObjects[approverId] = id;
				approvalIds.push(id);
			}
		}

		return approvalIds;
	},

	_updateApprovalIDs: function(old_approvalId, new_approvalID, activityID) {
		var child = new GlideRecord('wf_executing');
		child.addQuery('activity', activityID);
		child.addQuery('parent', activity.sys_id);
		child.query();
		if (!child.next())
			return;

		if (child.scratchpad.nil())
			return;
		var re = new RegExp(old_approvalId, 'g');
		child.scratchpad = child.getDisplayValue("scratchpad").replace(re, new_approvalID);;
		child.update();
	},
	
	_updateGroupApprovalIDs: function(old_approvalId, new_approvalID, activityID, sourceActivityId) {				
		var child = new GlideRecord('wf_executing');
		child.addQuery('activity', activityID);
		child.addQuery('parent', activity.sys_id);
		child.query();
		if (!child.next()) 
			return;
		
		if (child.scratchpad.nil())
			return;
		
		var source = new GlideRecord('wf_executing');
		source.addQuery('activity', sourceActivityId);
		source.addQuery('parent', activity.sys_id);
		source.query();
			
		if (!source.next())
			return;
			
		if (source.scratchpad.nil())
			return;
		
		var sSp = source.getDisplayValue("scratchpad");
		var cSp = child.getDisplayValue("scratchpad");
		var oldGrp = old_approvalId;
		var newGrp = new_approvalID;
		for (var oldGrpUserIdx in cSp[oldGrp]) {
			var oldGrpUser = cSp[oldGrp][oldGrpUserIdx];
			cSp["approval_ids"] = cSp["approval_ids"].filter(function(item) { return item !== oldGrpUser;});		
		}
		cSp["approval_ids"] = cSp["approval_ids"].filter(function(item) { return item !== oldGrp;});
		delete cSp[oldGrp];
		
		cSp["approval_ids"].push(newGrp);
		for (var newGrpUserIdx in sSp[newGrp]) {
			var newGrpUser = sSp[newGrp][newGrpUserIdx];
			cSp["approval_ids"].push(newGrpUser);
		}
		cSp[newGrp] = sSp[newGrp];
		child.scratchpad = cSp;
		child.update();
	},
	
	type: 'Approval_CoordinatorActivityHandler'
});
