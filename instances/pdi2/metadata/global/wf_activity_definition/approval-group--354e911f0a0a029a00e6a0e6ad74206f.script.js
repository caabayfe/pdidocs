/**
 * Group approvals are tracked by the group but requested from all group members
 */

var Approval___GroupActivityHandler = Class.create();
Approval___GroupActivityHandler.prototype = Object.extendsObject(WFActivityHandler, {
   
   initialize: function() {
      WFActivityHandler.prototype.initialize.call(this);
      this.approvalUtils = new WorkflowApprovalUtils();
      this.setDatesFlag = false;
   },
   
   onExecute: function() {
      /**
       * Create the approvals and (optionally) wait for them to either be approved or rejected.
       */
      
      // did we pre-generate the approvals?
      var approvals;
	  var groupMap = [];
      var genObj = this._getGenerateObj(activity.activity.toString());
      if (genObj && genObj.approvals) {
         approvals = genObj.approvals;
		 groupMap = genObj.groupMap;
         if (approvals.length > 0) {
            // In order to maintain the approval state if we revisit this approval activity
            // we need to only request those approvals that are currently in a Not Requested state
			 
			 var state = this._determineOverallState();
			 if (state && state != 'skipped') {
				 this.approvalUtils.setGroupApprovalsByIds(approvals, 'not_required', '', ['not requested']);
				 activity.state = state;
                 activity.result = state;	 
			 } else
				 this.approvalUtils.setGroupApprovalsByIds(approvals, 'requested', '', ['not requested']);
         }
      } else {
         // if we are a child of an Approval Manager activity, then we
         // create the approvals in a Not Requested state and let the AM
         // remove any duplicates before setting the approvals to Requested
         var state;
         if (activity.activity.parent.nil())
            state = 'requested';
         else
            state = 'not requested';
         
         this._setDueDate("");
         approvals = this._createApprovals(state);
		 groupMap = this.approvalUtils.getUserApprovalIdsForGroups(approvals);
      }
      this._removeGenerateObj(activity.activity.toString());
      
      // any approvals?
      if (approvals.length == 0)
         activity.result = 'skipped';
      else
         activity.state = 'waiting';
      
      // save the list of group approval ids
	  for (var idx in groupMap)
		  activity.scratchpad[idx] = groupMap[idx];
      activity.scratchpad.approval_ids = approvals;

      // If we are maintaining approval states (from the previous execution of the workflow),
      // then we need to determine our current state unless we are a child activity, in which
      // case we will be asked to determine our state after our parent has removed any duplicates
      if ((approvals.length > 0) && (workflow.scratchpad.maintainStateFlag == true) && activity.activity.parent.nil())
         this._onUpdate();
   },

   // override this to provide the proper stage state
   getFinalStageState: function() {
	   return new WFApprovalStages().getApprovalState(current, current.stage, activity);
   },

   onDetermineApprovalState: function() {
      this.forceState = true;
      this._onUpdate();
   },
   
   // The task has changed, see if we need to update our approval state
   onUpdate: function() {
      this._onUpdate();
   },
   
   _onUpdate: function() {
      var state = this._determineOverallState();
      if (GlideStringUtil.notNil(state) && (state != 'requested')) {
         this.approvalUtils.setPendingGroupApprovalsByIds(activity.scratchpad.approval_ids, 'not_required');
         activity.state = 'finished';
         activity.result = state;
      } else if ((state == 'requested') && (activity.result != state)) {
         // changed back to requested state (unapprove can do this)
         activity.state = 'waiting';
         activity.result = '';
      } else if ((GlideStringUtil.nil(state)) && (GlideStringUtil.nil(activity.result))) {
         // deleting the Group approval with cascade delete to approvals can do this
         activity.state = 'finished';
         activity.result = 'skipped';
      }
   },
   
   // The approval was cancelled
   onCancel: function() {
      this.approvalUtils.setPendingGroupApprovalsByIds(activity.scratchpad.approval_ids, 'cancelled');
	  this.approvalUtils.setPendingUserApprovalsByGroup(activity.scratchpad.approval_ids, 'cancelled');
      activity.state = 'cancelled';
      activity.result = 'cancelled';
   },
   
   /**
    * Create the approvals as a forward-looking process in which we just create, but do not
    * process the approvals.  This allows the approvals to be generated up front before the
    * workflow runs such that the approvals are visible prior to being requested.
    */
   _generate: function(approvalOrder, startAt, noCreateFlag) {
      this.approvalUtils = new WorkflowApprovalUtils();
      var genObj = {};
      this._setDueDate(startAt);
      this.setDatesFlag = true;
      if (!noCreateFlag) {
         genObj.approvals = this._createApprovals('not requested', approvalOrder);
		 genObj.groupMap = this.approvalUtils.getUserApprovalIdsForGroups(genObj.approvals);
	  }
      genObj.duration = this.duration;
      return genObj;
   },
   
   // Create the approval(s) based on the variables that are specified
   _createApprovals: function(state, approvalOrder) {
      this.existingIds = this._getExistingApprovals();
      var groupIds = this._getGroupIds();
      var approvalIds = this._buildApprovals(groupIds, state, approvalOrder);
      this._checkDroppedApprovals(approvalIds);
      return approvalIds;
   },
   
   _getExistingApprovals: function() {
      var ids = {};
      gr = new GlideRecord('sysapproval_group');
      gr.initialize();
      gr.addQuery('parent', current.sys_id);
      gr.addQuery('wf_activity', activity.activity.sys_id);
      gr.addQuery('approval', '!=', 'cancelled');
      gr.query();
      while (gr.next())
         ids[gr.assignment_group.toString()] = gr.sys_id.toString();
      
      return ids;
   },
   
   _getGroupIds: function() {
      // does the condition match?
      if (!this._isConditionMatch())
         return [];
      
      var groups = {};
      
      // groups
      this.approvalUtils.addIdsToApprovalList(groups, activity.vars.groups + '');
      
      // additional approvers script
      if (activity.vars.advanced && activity.vars.approver_script) {
      	try {
        	var ids = this.runScript(activity.vars.approver_script);
	        if (ids) {
	           if (typeof(ids) == 'string') {
	              ids = ids.split(','); 
	           }
	           this.approvalUtils.addIdsToApprovalList(groups, ids);
	        }
         } catch (ex) {
         	if (JSUtil.isEmpty(groups)) {
         		//no other approver and the advanced script failed = fault
         		throw 'No Approval Group selected and advanced script encountered an error:'+ ex.message;
         	} else {
         		//at least one approver came from the other fields in the activity, log the error but no fault
            	workflow.error('advanced script encountered an error:' + ex.message);
            }
         }
      }
      
      return groups;
   },
   
   _buildApprovals: function(groupIds, state, approvalOrder) {
      var approvalIds = [];
      for (var id in groupIds) {
         var approvalId = this._createApproval(id, state, approvalOrder);
         if (approvalId)
            approvalIds.push(approvalId);
      }
	   
      return approvalIds;
   },
   
   /**
    * Create a new group approval or update an existing group approval
    */
   _createApproval: function(groupId, state, approvalOrder) {
      var approvalId;
      if (this.existingIds && this.existingIds[groupId]) {
         approvalId = this.existingIds[groupId];
         this._setApprovalState(approvalId, state);
      } else
      approvalId = this._createNewApproval(groupId, state, approvalOrder);
      
      return approvalId;
   },
   
   _createNewApproval: function(groupId, state, approvalOrder) {
      // make sure there are users of the group before creating it
      var ids = this.approvalUtils.getMembersOfGroup(groupId);
      if (ids.length == 0)
         return "";
      
      var approval = new GlideRecord('sysapproval_group');
      approval.assignment_group = groupId;
      approval.parent = current.sys_id;
	  approval.parent.setRefRecord(current);
      approval.wf_activity = activity.activity.sys_id;
      approval.approval = state;
      if (approvalOrder)
         approval.order = approvalOrder;
      
      approval.expected_start.setValue(this.expected_start);
      approval.due_date.setValue(this.due_date);
      return approval.insert();
   },
   
   _setDueDate: function(startAt) {
      this.expected_start = new GlideDateTime();
      if (startAt)
         this.expected_start.setValue(startAt);
      
      var wd = new WorkflowDuration();
      wd.setActivity(this);
      wd.setStartDateTime(startAt);
      wd.setWorkflow(context.schedule, context.timezone);
      wd.calculate(activity.vars.__var_record__);
      this.due_date = new GlideDateTime(wd.getEndDateTime());
      this.duration = wd.getTotalSeconds() * 1000;
   },
   
   /**
    * Set the state of the approval to the specified state
    */
   _setApprovalState: function(approvalId, state) {
      if (workflow.scratchpad.maintainStateFlag == true)
         return;
      
      var approval = new GlideRecord('sysapproval_group');
      if (!approval.get(approvalId))
         return;
      
      approval.approval = state;
      if (this.setDatesFlag) {
         approval.expected_start.setValue(this.expected_start);
         approval.due_date.setValue(this.due_date);
      }
      approval.update();
   },
   
   /**
    * Delete any approvals that we previously created but did not match during
    * this creation pass
    */
   _checkDroppedApprovals: function(approvalIds) {
      if (!this.existingIds)
         return;
      
      var prevIds = {};
      for (var id in this.existingIds)
         prevIds[this.existingIds[id]] = true;
      
      for (var i = 0; i < approvalIds.length; i++)
         prevIds[approvalIds[i]] = false;
      
      var dropIds = [];
      for (var id in prevIds) {
         if (prevIds[id])
            dropIds.push(id);
      }
      
      if (dropIds.length > 0) {
         var gr = new GlideRecord('sysapproval_group');
         gr.addQuery('sys_id', dropIds);
         gr.query();
         while (gr.next()) {
            this.approvalUtils.addApprovalHistoryGR(current, gs.getMessage("Group approval for {0} deleted since it no longer matches approval rule {1}.", [gr.assignment_group.name.toString(), activity.activity.name.toString()]));
            gr.deleteRecord();
         }
      }
   },
   
   _isConditionMatch: function() {
      if (!activity.vars.condition.toString())
         return true;
      
      return GlideFilter.checkRecord(current, activity.vars.condition);
   },
   
   // Determine the overall state of the approvals (approved, rejected or '')
   _determineOverallState: function() {
      var ids = activity.scratchpad.approval_ids;
      if (!ids)
         return 'skipped';
      
      var waitFor = activity.vars.wait_for;
      if (waitFor == 'script') {
         if (!activity.vars.approval_script)
            return 'approved';
         
         // Set up information to be passed to the script
         //    overall counts
         var ret = this.approvalUtils.getGroupIdListApprovalCounts(ids);
         ret.counts['total'] -= ret.counts['not_required'];
         ret.counts['total'] -= ret.counts['duplicate'];
         ret.counts['total'] -= ret.counts['cancelled'];
         workflow.prepareScriptVariable('counts', ret.counts);
         workflow.prepareScriptVariable('approvalIDs', ret.approvalIDs);
         
         //    group level counts and user ids
         var groups = {};
		 var groupRet = {};
         for (var i = 0; i < ids.length; i++) {
            var id = ids[i];
			 
			// Jakarta: 
			// We now track the approvals in the scratchpad for better 
			// detection of duplicate user approvals that were deleted
			if (GlideStringUtil.notNil(activity.scratchpad[id]) && typeof activity.scratchpad[id] !== "undefined")
				groupRet = this.approvalUtils.getGroupUserApprovalCounts(activity.scratchpad[id]);
			else
				groupRet = this.approvalUtils.getUserGroupApprovalCounts(id);
			 
            groups[id] = {};
            groups[id].approvalIDs = groupRet.approvalIDs;
            for (var s in groupRet.counts)
               groups[id][s] = groupRet.counts[s];
         } 
         
         workflow.prepareScriptVariable('groups', groups);
         var newState = this.runScript(activity.vars.approval_script);
         workflow.removeScriptVariable('groups');
         workflow.removeScriptVariable('approvalIDs');
         workflow.removeScriptVariable('counts');
		  
		 // If the newState is not requested then it has changed to Approved, Rejected, Cancelled
		 // or a custom state so mark any remaining Group approvals to No Longer Required
		 if (newState && GlideStringUtil.notNil(newState) && (newState != 'requested')) {
			 var groupApprovals = new GlideRecord('sysapproval_group');
			 groupApprovals.addQuery('sys_id', ids);
			 groupApprovals.query();
			 while (groupApprovals.next()) {
				 groupApprovals.approval = newState;
				 if (gs.getProperty('glide.workflow.approval.group_match_state', "true") == "true") {
					groupApprovals.state = this._determineGrApprovalNewState(newState);
					if (newState != 'not requested') {
						groupApprovals.active = false;
						groupApprovals.closed_by = gs.getUserID();
						groupApprovals.closed_at = gs.nowDateTime();
					}
				 }
				 groupApprovals.setWorkflow(false);
				 groupApprovals.update();
				 this.approvalUtils.setPendingUserApprovalsByGroup(groupApprovals.sys_id, 'not_required');
			 }
			 if (gs.getProperty('glide.workflow.approval.group_script_history', "true") == "true")
				 this.approvalUtils.addApprovalHistoryGR(current, gs.getMessage("Approval state changed to '{0}' by 'Approval Script'.", [newState]));

		 }
		  
		 if (!newState || GlideStringUtil.nil(newState))
			 newState = 'requested';
		  
         return newState;
      }
      
      // check for approval state change within each group
      var rejectHandling = activity.vars.reject_handling;
      var changed = false;
      var groupApprovals = new GlideRecord('sysapproval_group');
      groupApprovals.addQuery('sys_id', ids);
      groupApprovals.query();
      while (groupApprovals.next()) {
         if (this._determineGroupState(groupApprovals, waitFor, rejectHandling))
            changed = true;
      }
      
      if (!changed && !this.forceState)
         return '';
      
      // And then the overall state
      var ret = this.approvalUtils.getGroupIdListApprovalCounts(ids);
      ret.counts['total'] -= ret.counts['not_required'];
      ret.counts['total'] -= ret.counts['duplicate'];
      ret.counts['total'] -= ret.counts['cancelled'];
      if (ret.counts['total'] == 0)
         return 'skipped';
      
      if ((ret.counts['rejected'] > 0) && (rejectHandling == 'reject'))
         return 'rejected';
      
      if ((waitFor == 'any' || waitFor == 'first_any') && (ret.counts['approved'] > 0))
         return 'approved';
      
      if ((waitFor == 'first_any') && (ret.counts['rejected'] > 0))
         return 'rejected';
      
      if ((waitFor == 'all' || waitFor == 'any_each' || waitFor == 'first_each') && (ret.counts['approved'] == ret.counts['total']))
         return 'approved';
      
      if ((ret.counts['rejected'] + ret.counts['approved']) == ret.counts['total']) {
         // we are complete - we have to make a decision
         return 'rejected';
      }
      
      return 'requested';
   },
	
	// Get approval state based on approval (same logic as BR "SNC - Match state to approval")
   _determineGrApprovalNewState: function(approval) {      
      if (approval === 'not requested')
         return '-5'; // Pending

      else if (approval === 'requested')
         return '1'; // Open

      else if (approval === 'approved' || approval === 'rejected')
         return '3'; // Closed Complete

      else if (approval === 'cancelled')
         return '4'; // Closed Incomplete

      else if (approval === 'not_required')
         return '7'; // Closed Skipped
   },
   
   // Determine approval state for a group approval
   _determineGroupState: function(gr, waitFor, rejectHandling) {
      if (gr.admin_override == true)
         return true;		// force a determination of overall state since this might be the first change for admin override
      
      var currentState = gr.approval + '';
      var newState = "requested";
      var user;
      var ret = {};
	
	  // Jakarta: 
	  // We now track the approvals in the scratchpad for better 
	  // detection of duplicate user approvals that were deleted
	  if (GlideStringUtil.notNil(activity.scratchpad[gr.sys_id]) && typeof activity.scratchpad[gr.sys_id] !== "undefined")
		  ret = this.approvalUtils.getGroupUserApprovalCounts(activity.scratchpad[gr.sys_id]);
	  else
		  ret = this.approvalUtils.getUserGroupApprovalCounts(gr.sys_id);
	   
      ret.counts['total'] -= ret.counts['not_required'];
      ret.counts['total'] -= ret.counts['cancelled'];
      if (ret.counts['total'] == 0) {
		  if (currentState == 'rejected')
			  newState = 'rejected';
		 else if (currentState == 'cancelled')
			  newState = 'cancelled';
		 else if (currentState == 'not_required')
			  newState = 'not_required';
         else
			 newState = 'approved';
         
      } else if ((waitFor == 'first_any' || waitFor == 'first_each') && (ret.counts['rejected'] > 0)) {
         // first response with a rejection
         newState = 'rejected';
         user = ret.approvalIDs['rejected'][0];
         
      } else if ((waitFor == 'first_any' || waitFor == 'first_each') && (ret.counts['approved'] > 0)) {
         // first response with an approval
         newState = 'approved';
         user = ret.approvalIDs['approved'][0];
         
      } else if ((rejectHandling == 'reject') && (ret.counts['rejected'] > 0)) {
         // first reject and rejection handling is reject immed.
         newState = 'rejected';
         user = ret.approvalIDs['rejected'][0];
         
      } else if ((waitFor == 'any' || waitFor == 'any_each') && (ret.counts['approved'] > 0)) {
         // any approval and we have one
         newState = 'approved';
         user = ret.approvalIDs['approved'][0];
         
      } else if ((waitFor == 'all') && (ret.counts['approved'] == ret.counts['total'])) {
         // all approval and we have all
         newState = 'approved';
         
      } else if ((waitFor == 'any' || waitFor == 'any_each') && (ret.counts['rejected'] == ret.counts['total'])) {
         // any approval, but everyone has rejected
         newState = 'rejected';
         user = ret.approvalIDs['rejected'][0];
      }
      
      // If all approvals are 'not_required' and currentState is rejected, cancelled, not_required, or approve
	  // Then the group approval was either rejected, cancelled, not_required, or approved
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
	  
	  // Check for the Approval coming from Group Approval record (sysapproval_group)
	  if (newState && (currentState == newState))
		  return true;
	   
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
         comment = gs.getMessage("Group approval for {0} reset to requested due to user approval change from {1} to requested ({2}).", [groupName, currentState, activity.activity.name.toString()]);
      
      else if (newState == 'approved') {
         if (user)
            comment = gs.getMessage("Group approval for {0} approved by user {1} ({2}).", [groupName, userName, activity.activity.name.toString()]);
         else
            comment = gs.getMessage("Group approval for {0} approved by all users ({1}).", [groupName, activity.activity.name.toString()]);
      }
      
      else if (newState == 'rejected') {
         if (user)
            comment = gs.getMessage("Group approval for {0} rejected by user {1} ({2}).", [groupName, userName, activity.activity.name.toString()]);
         else
            comment = gs.getMessage("Group approval for {0} rejected by all users ({1}).", [groupName, activity.activity.name.toString()]);
      }
      
      if (comment)
         this.approvalUtils.addApprovalHistoryGR(current, comment);
   },
	
   type: 'Approval___GroupActivityHandler'
});
