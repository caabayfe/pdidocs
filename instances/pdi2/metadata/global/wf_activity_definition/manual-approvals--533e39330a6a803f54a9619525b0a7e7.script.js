/**
 * Handle manual user and group approvals that the user has added to the task.
 * Since these approvals are not managed by any workflow activity, we have to
 * watch these from this activity instead.
 **/
var Manual_ApprovalsActivityHandler = Class.create();
Manual_ApprovalsActivityHandler.prototype = Object.extendsObject(WFActivityHandler, {

   initialize: function() {
      WFActivityHandler.prototype.initialize.call(this);
      this.approvalUtils = new WorkflowApprovalUtils();
   },

   onExecute: function() {
      // Go ahead and request all of the pending approvals
      this._requestApprovals('onExecute');

      // Determine our overall state since there usually are no manual approvals
      if (activity.state != 'finished')
         activity.state = 'waiting';
   },

   // The task has changed, see if we need to update our approval state
   onUpdate: function() {
      this._onUpdate();
   },

   // The approval was cancelled
   onCancel: function() {
      var ids = this._getApprovalIds();
      this.approvalUtils.setPendingGroupApprovalsByIds(ids, 'cancelled');
      this.approvalUtils.setPendingUserApprovalsByIds(ids, 'cancelled');
      activity.state = 'cancelled';
      activity.result = 'cancelled';
   },

   onDetermineApprovalState: function() {
	   this._onUpdate();
   },

   _onUpdate: function() {
       // PRB1115684: There was a bug that allowed a Manual Approval activity to
	   // restart after an update when contained in an executing Approval Coordinator
	   // Added property to preserve the behavior for existing customers
	   if (gs.getProperty('glide.manual.approval.pickup_on_update', "false") == "true")
	     this._requestApprovals('_onUpdate');

	   var ids = this._getApprovalIds();
       var state = this._determineOverallState(ids);
       if (activity.result != state) {
           if ((state == 'approved') || (state == 'rejected') || (state == 'skipped')) {
               this.approvalUtils.setPendingGroupApprovalsByIds(ids, 'not_required');
               this.approvalUtils.setPendingUserApprovalsByIds(ids, 'not_required');
               activity.state = 'finished';
               activity.result = state;
           } else if (state == 'requested') {
        	   // changed back to requested state (unapprove can do this)
               activity.state = 'waiting';
               activity.result = '';
           }
       }
   },

   _requestApprovals: function(eventHandler) {
	  var approvals = [];
	  var approvalIds = [];
	  var approvalGroupIds = [];
	  var approvalIdsObject = activity.scratchpad;
	  var siblingGroupIds = {};

      // If the property glide.manual.approval.pickup_on_update is true will come through to pick
      // up any new approvals every update, we don't want to wipe out our existing approval maps
	  if (activity.scratchpad != null && activity.scratchpad != "") {
		  approvalIds = activity.scratchpad["approval_ids"];

		  var keys = Object.keys(activity.scratchpad);
		  for (var k in keys) {
			  if (keys[k] == "approval_ids" || keys[k] == "approver_objects")
				  continue;

			  approvalIdsObject[keys[k]] = activity.scratchpad[keys[k]];
		  }
	  }

	  if (eventHandler != "onExecute" && activity.activity.parent != undefined && !GlideStringUtil.nil(activity.activity.parent)) {
		  // Get all groups approvals for sibling activities.
		  var siblingGroups = new GlideRecord("sysapproval_group");
		  siblingGroups.addQuery('wf_activity.parent', activity.activity.parent);
		  siblingGroups.addQuery('wf_activity', '!=', activity.activity.sys_id);
		  siblingGroups.addQuery('parent', current.getUniqueValue());
		  siblingGroups.addQuery('approval', 'not requested').addOrCondition('approval', 'requested');
		  siblingGroups.query();
		  while (siblingGroups.next())
			 siblingGroupIds[siblingGroups.getValue('assignment_group')] = siblingGroups.getUniqueValue();
	  }

	  // Request all Group Approvals
	  var group = new GlideRecord('sysapproval_group');
	  group.addQuery('parent', current.sys_id);
	  group.addQuery('approval', 'not requested').addOrCondition('approval', 'requested');
	  var groupActivityQuery = group.addNullQuery('wf_activity');
	  if (eventHandler === "onExecute")
		groupActivityQuery.addOrCondition('wf_activity', activity.activity.sys_id);
	  group.orderBy('sys_created_on','ASC');
	  group.query();
	  while (group.next()) {
		  var groupApprovalId = group.getUniqueValue();
		  var groupId = group.assignment_group;
		  if (!approvalIdsObject[groupId] && siblingGroupIds[groupId] == undefined) {
			  approvalIds.push(groupApprovalId);
			  approvalGroupIds.push(groupApprovalId);
			  approvalIdsObject[groupId] = true;
			  group.setValue('approval', 'requested');
			  group.setValue('wf_activity', activity.activity.sys_id);
			  group.update();
		  } else {
			  this.approvalUtils.addApprovalHistoryGR(current, gs.getMessage("Duplicate group approval removed for {0}.", [ group.assignment_group.name.toString() ]));
			  group.setWorkflow(false);
			  group.deleteRecord();
		  }

		  // get all user approvals
		  approvals = this._getUserApprovals(groupApprovalId);
		  activity.scratchpad[groupApprovalId] = approvals;
	  }

	  // Request all User Approvals
      var approvalsGR = new GlideRecord('sysapproval_approver');
	  approvalsGR.addQuery('sysapproval', current.sys_id);
	  var qc = approvalsGR.addQuery('state', 'not requested');
	  qc.addOrCondition('state', 'requested');
	  qc.addOrCondition('group', approvalGroupIds);
	  userActivityQuery = approvalsGR.addNullQuery('wf_activity');
	  if (eventHandler === "onExecute")
		userActivityQuery.addOrCondition('wf_activity', activity.activity.sys_id);
	  approvalsGR.query();
	  while (approvalsGR.next()) {
		  var approvalId = approvalsGR.getUniqueValue();
		  var userId = approvalsGR.approver;
		  approvalIds.push(approvalId);
		  approvalIdsObject[userId] = true;
		  approvalsGR.setValue('state', 'requested');
		  approvalsGR.setValue('wf_activity', activity.activity.sys_id);
		  approvalsGR.update();
	  }

	  if (approvalIds.length == 0) {
		  activity.state = "finished";
	      activity.result = "skipped";
	  }

	  activity.scratchpad.approval_ids = approvalIds;
   },

	_getUserApprovals: function(groupId) {
		var approvals = [];
		var approvalsGR = new GlideRecord("sysapproval_approver");
		approvalsGR.addQuery("group", groupId);
		approvalsGR.query();
		while (approvalsGR.next())
			approvals.push(approvalsGR.getUniqueValue());

		return approvals;
	},

	// Get the list of manual user and group approvals
    _getApprovalIds: function() {
	   // Jakarta:
	   // We now track the approvals in the scratchpad for better
	   // detection of duplicate user approvals that were deleted
	   if (GlideStringUtil.notNil(activity.scratchpad.approval_ids)) {
		   return activity.scratchpad.approval_ids;
		}

       var ids = [];
       var gr = new GlideRecord('sysapproval_group');
       gr.addQuery('parent', current.sys_id);
       gr.addNullQuery('wf_activity');
       gr.query();
       while (gr.next())
          ids.push(gr.sys_id.toString());

       var gr = new GlideRecord('sysapproval_approver');
       gr.addQuery('sysapproval', current.sys_id);
       gr.addNullQuery('group');
       gr.addNullQuery('wf_activity');
       gr.query();
       while (gr.next())
          ids.push(gr.sys_id.toString());

	   return ids;
   },

   // Determine the overall state of the approvals (approved, rejected or '')
   _determineOverallState: function(ids) {
	  if (ids.length == 0)
         return 'skipped';

      var changed = false;
      var groupApprovals = new GlideRecord('sysapproval_group');
      groupApprovals.addQuery('sys_id', ids);
      groupApprovals.query();
      while (groupApprovals.next()) {
         if (this._determineGroupState(groupApprovals))
            changed = true;
      }

      var waitFor = activity.vars.wait_for;
      var rejectHandling = activity.vars.reject_handling;
      var groupRet = this.approvalUtils.getGroupIdListApprovalCounts(ids);
      var ret = this.approvalUtils.getUserIdListApprovalCounts(ids);

      for (var s in ret.counts) {
         if (groupRet.counts[s])
            ret.counts[s] += groupRet.counts[s];
      }

      ret.counts['total'] -= ret.counts['not_required'];
      ret.counts['total'] -= ret.counts['cancelled'];
      if (ret.counts['total'] == 0)
         return 'skipped';

      if ((ret.counts['rejected'] > 0) && (rejectHandling == 'reject'))
         return 'rejected';

      if ((waitFor == 'any' || waitFor == 'first') && (ret.counts['approved'] > 0))
         return 'approved';

      if ((waitFor == 'first') && (ret.counts['rejected'] > 0))
         return 'rejected';

      if ((waitFor == 'all') && (ret.counts['approved'] == ret.counts['total']))
         return 'approved';

      if ((ret.counts['rejected'] + ret.counts['approved']) == ret.counts['total']) {
         // we are complete - we have to make a decision
         return 'rejected';
      }

      return 'requested';
   },

   // Determine approval state for a group approval
   _determineGroupState: function(gr) {
      if (gr.admin_override)
         return true; // force a determination of overall state since this might be the first change for admin override
      var currentState = gr.approval + '';
      if ((currentState == 'not_required') ||
         (currentState == 'not requested') ||
      (currentState == 'cancelled'))
      return false;

      var waitFor = gr.wait_for;
      var rejectHandling = gr.reject_handling;
      var newState = "requested";
      var user;
      var mootPeers = false;

	  // Jakarta:
	  // We now track the approvals in the scratchpad for better
	  // detection of duplicate user approvals that were deleted
      var ret = {};
	  if (GlideStringUtil.notNil(activity.scratchpad[gr.sys_id]))
		  ret = this.approvalUtils.getGroupUserApprovalCounts(activity.scratchpad[gr.sys_id]);
	  else
		  ret = this.approvalUtils.getUserGroupApprovalCounts(gr.sys_id);

	  ret.counts['total'] -= ret.counts['not_required'];
      ret.counts['total'] -= ret.counts['cancelled'];
      if (ret.counts['total'] == 0) {
         newState = 'approved';
         mootPeers = true;

      } else if ((waitFor == 'first') && (ret.counts['rejected'] > 0)) {
         // first response with a rejection
         newState = 'rejected';
         user = ret.approvalIDs['rejected'][0];
         mootPeers = true;

      } else if ((waitFor == 'first') && (ret.counts['approved'] > 0)) {
         // first response with an approval
         newState = 'approved';
         user = ret.approvalIDs['approved'][0];
         mootPeers = true;

      } else if ((rejectHandling == 'reject') && (ret.counts['rejected'] > 0)) {
         // first reject and rejection handling is reject immed.
         newState = 'rejected';
         user = ret.approvalIDs['rejected'][0];
         mootPeers = true;

      } else if ((waitFor == 'any') && (ret.counts['approved'] > 0)) {
         // any approval and we have one
         newState = 'approved';
         user = ret.approvalIDs['approved'][0];
         mootPeers = true;

      } else if ((waitFor == 'all') && (ret.counts['approved'] == ret.counts['total'])) {
         // all approval and we have all
         newState = 'approved';
         mootPeers = true;

      } else if ((waitFor == 'any') && (ret.counts['rejected'] == ret.counts['total'])) {
         // any approval, but everyone has rejected
         newState = 'rejected';
         user = ret.approvalIDs['rejected'][0];
      }

      if (newState && (currentState != newState)) {
         gr.approval = newState;
         if (user)
            gr.approval_user = user;
         else if (newState == 'requested')
            gr.approval_user = "";

         this._setGroupApprovalComment(gr, currentState, newState, user);

         gr.update();
         return true;
      }
      return false;
   },

   _setGroupApprovalComment: function(gr, currentState, newState, user) {
      var groupName = gr.assignment_group.name.toString();
      // PRB1326306 dot-walking doesn't work in cross domain group approval
      if (!groupName && gr.assignment_group) {
         var agGr = new GlideRecord(gr.assignment_group.getReferenceTable());
         agGr.addQuery('sys_id', gr.assignment_group.toString());
         agGr.queryNoDomain();
         if (agGr.next())
            groupName = agGr.name.toString();
      }
      var userName = this.approvalUtils.getUserName(user);
      var comment;
      if (newState == 'requested')
         comment = gs.getMessage("Manual group approval for {0} reset to requested due to user approval change from {1} to requested.", [groupName, currentState]);
      else if (newState == 'approved') {
         if (user)
            comment = gs.getMessage("Manual group approval for {0} approved by user {1}.", [groupName, userName]);
         else
            comment = gs.getMessage("Manual group approval for {0} approved by all users.", [groupName]);
      } else if (newState == 'rejected') {
         if (user)
            comment = gs.getMessage("Manual group approval for {0} rejected by user {1}.", [groupName, userName]);
         else
            comment = gs.getMessage("Manual group approval for {0} rejected by all users.", [groupName]);
      }

      if (comment)
         this.approvalUtils.addApprovalHistoryGR(current, comment);
   },

   type: 'Manual_ApprovalsActivityHandler'
});
