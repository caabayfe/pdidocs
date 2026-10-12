// Workflow activity definition handler class

//
// Implement activity definition handling in the onExecute method
//
// Implement any event handlers for the activity definition as a method named 'on[event_name]'
// For example, to handle the 'cancel' event, implement an 'onCancel' method
//

var Approval___UserActivityHandler = Class.create();
Approval___UserActivityHandler.prototype = Object.extendsObject(WFActivityHandler, {
   
   initialize: function() {
      WFActivityHandler.prototype.initialize.call(this);
      this.approvalUtils = new WorkflowApprovalUtils();
      this.setDatesFlag = false;
   },
   
   onExecute: function() {
      /**
       * Create the approvals and wait for them to either be approved or rejected.
       */
      
      // did we pre-generate the approvals?
      var approvals;
      var genObj = this._getGenerateObj(activity.activity.toString());
      if (genObj && genObj.approvals) {
         approvals = genObj.approvals;
         if (approvals.length > 0) {
			var state = this.approvalUtils.getUserApprovalStateById(approvals);
			 if( state && state != 'not requested') {
				 this.approvalUtils.setUserApprovalsByIds(approvals, 'not_required', '', ['not requested']);
				 activity.state = state;
                 activity.result = state; 
			 } else
				this.approvalUtils.setUserApprovalsByIds(approvals, 'requested', '', ['not requested']);
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
      }
      this._removeGenerateObj(activity.activity.toString());
      
      // any approvals?
      if (approvals.length == 0)
         activity.result = 'skipped';
      else
         activity.state = 'waiting';
      
      // save the list of approval ids
      activity.scratchpad.approval_ids = approvals;
      
      // If we are maintaining approval states (from the previous execution of the workflow),
      // then we need to determine our current state unless we are a child activity, in which
      // case we will be asked to determine our state after our parent has removed any duplicates
      if ((approvals.length > 0) && (workflow.scratchpad.maintainStateFlag == true) && activity.activity.parent.nil())
        this._onUpdate();
   },
   
   onDetermineApprovalState: function() {
      this._onUpdate();
   },
   
   // The task has changed, see if we need to update our approval state
   onUpdate: function() {
      this._onUpdate();
   },
	
   // override this to provide the proper stage state
   getFinalStageState: function() {
	   return new WFApprovalStages().getApprovalState(current, current.stage, activity);
   },
	
   _onUpdate: function() {
      var state = this._determineOverallState();
      if (state && (state != 'requested')) {
         this.approvalUtils.setPendingUserApprovalsByIds(activity.scratchpad.approval_ids, 'not_required');
         activity.state = 'finished';
         activity.result = state;
      } else if ((state == 'requested') && (activity.result != state)) {
         // changed back to requested state (unapprove can do this)
         activity.state = 'waiting';
         activity.result = '';
      }
   },
   
   // The approval was cancelled
   onCancel: function() {
      this.approvalUtils.setPendingUserApprovalsByIds(activity.scratchpad.approval_ids, 'cancelled');
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
      if (!noCreateFlag)
         genObj.approvals = this._createApprovals('not requested', approvalOrder);
      genObj.duration = this.duration;
      return genObj;
   },
   
   // Create the approval(s) based on the variables that are specified
   _createApprovals: function(state, approvalOrder) {
      this.existingIds = this._getExistingApprovals();
      var userIds = this._getUserIds();
      var approvalIds = this._buildApprovals(userIds, state, approvalOrder);
      this._checkDroppedApprovals(approvalIds);
      return approvalIds;
   },
   
   _getExistingApprovals: function() {
      var ids = {};
      gr = new GlideRecord('sysapproval_approver');
      gr.initialize();
	  
	  var table = current.getRecordClassName();
      // For non task related tables, add the query on document id 
	   // For task relatd tables add the query based on sysapproval as this is what is being set while creating new approval
	   if( table != null && this.approvalUtils.isTask(table) ) {
		 // Task table
		 gr.addQuery('sysapproval', current.sys_id);  
      } else {
         // Non task table  
         gr.addQuery('document_id', current.sys_id);  	  
	  }
      gr.addQuery('wf_activity', activity.activity.sys_id);
      gr.addQuery('state', '!=', 'cancelled');
      gr.query();
      while (gr.next())
         ids[gr.approver.toString()] = gr.sys_id.toString();
      
      return ids;
   },
   
   _getUserIds: function() {
      // does the condition match?
      if (!this._isConditionMatch())
         return [];
      
      var users = {};
      var groups = {};
      
      // users
      this.approvalUtils.addIdsToApprovalList(users, activity.vars.users + '');
      
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
           		this.approvalUtils.addUsersAndGroupsToApprovalList(users, groups, ids);
        	}
         } catch (ex) {
         	if (JSUtil.isEmpty(users)) {
         		//no other approver and the advanced script failed = fault
         		throw 'No Approval User selected and advanced script encountered an error:'+ ex.message;
         	} else {
         		//at least one approver came from the other fields in the activity, log the error but no fault
            	workflow.error('advanced script encountered an error:' + ex.message);
            }
         }
      }
	   
	 for (var id in groups) {
         var ids = this.approvalUtils.getMembersOfGroup(id);
         this.approvalUtils.addIdsToApprovalList(users, ids);
      }
      
      return users;
   },
   
   _buildApprovals: function(userIds, state, approvalOrder) {
      var approvalIds = [];
      for (var id in userIds)
         approvalIds.push(this._createApproval(id, state, approvalOrder));
      
      return approvalIds;
   },
   
   /**
    * Create a new use approval or update an existing user approval
    */
    _createApproval: function(userId, state, approvalOrder) {
      var approvalId;
      if (this.existingIds && this.existingIds[userId]) {
         approvalId = this.existingIds[userId];
         this._setApprovalState(approvalId, state);
      } else
      approvalId = this._createNewApproval(userId, state, approvalOrder);
      
      return approvalId;
   },
 
     //fdt- expanding approval - user to be generic. To that end, back-setting the legacy taks
     //values for backwards compatability, but going forward adding document_id/source table
     //sysapproval is only valid if the table is of type task, otherwise
     //the type approval is for a non-task derived table in which case the document_id
     //is derived from the current.getUniqueValue() and getRecordClassName();
   
    _createNewApproval: function(userId, state, approvalOrder) {
      var approval = new GlideRecord('sysapproval_approver');
      approval.initialize();
      var table = current.getRecordClassName();
      var guid = current.getUniqueValue();
      //fdt logic added for generic approval       
      // if this is a task table, then keep the sysapproval insynch with document id
      // this will keep all the service catalog workflows working
      if( table != null && this.approvalUtils.isTask(table) ) {
         approval.sysapproval = current.sys_id; 
		 approval.sysapproval.setRefRecord(current);
	  }
      approval.document_id = guid;
	  approval.document_id.setRefRecord(current);
      approval.source_table = table; 
      approval.approver = userId;
      approval.approval_column = this.js(activity.vars.approval_column);
      approval.approval_journal_column = this.js(activity.vars.approval_history);

      approval.wf_activity = activity.activity.sys_id;
      approval.state = state;
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
      
      var approval = new GlideRecord('sysapproval_approver');
      if (!approval.get(approvalId))
         return;
      
      approval.state = state;
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
         var gr = new GlideRecord('sysapproval_approver');
         gr.addQuery('sys_id', dropIds);
         gr.query();
         while (gr.next()) {
            this.approvalUtils.addApprovalHistoryGR(current, gs.getMessage("User approval for {0} deleted since it no longer matches approval rule {1}.", [gr.approver.name.toString(), activity.activity.name.toString()]));
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
      var ret = this.approvalUtils.getUserIdListApprovalCounts(ids);
      if (waitFor == 'script') {
         if (!activity.vars.approval_script)
            return 'approved';
         
         workflow.prepareScriptVariable('counts', ret.counts);
         workflow.prepareScriptVariable('approvalIDs', ret.approvalIDs);
         var state = this.runScript(activity.vars.approval_script);
         return state;
      }
      
      var rejectHandling = activity.vars.reject_handling;
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
   
   type: 'Approval___UserActivityHandler'
});
