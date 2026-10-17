var isFD = isFlowDesigner(current);
sendEventsNonTask();

function isFlowDesigner(me) {
   if (!me.wf_activity.nil())
      return false;
   if (!me.group.nil() && (me.group.wait_for == "process_flow"))
      return true;

   var listenerGr = new GlideRecord('sys_flow_listener');
   listenerGr.addQuery('listening_to', me.document_id);
   listenerGr.addQuery('source_table', me.source_table);
   listenerGr.addQuery('name', 'Ask For Approval');
   listenerGr.addQuery('state', 'WAITING');
   listenerGr.query();
   return listenerGr.hasNext();
}

function getEventPrefix(sourceTable) {
	if (sourceTable!=null && sourceTable.startsWith('kb_template')) {
		return "kb_knowledge";
	}
	return sourceTable;
}

function sendEventsNonTask() {
   if (!current.state.changes()) 
      return;

   var event = getEventPrefix(current.source_table);
   var approvalCommentsUtil = new ApprovalCommentsUtil();
   var approvalComment = approvalCommentsUtil.getApprovalComment(current, isFD);
   var mayBeSystem = approvalCommentsUtil.canAddCommentAsSystem(current) == true ? 'system' : null;

   switch (current.state + "") {    
      case 'cancelled':
         event += ".approval.cancelled";
         gs.eventQueue(event, current, gs.getUserID(), gs.getUserName());
         break;
      case 'requested':
         event += ".approval.inserted";
         gs.eventQueue(event, current, gs.getUserID(), gs.getUserName());
         updateRecord(current, approvalComment);
	 break;
      case 'rejected':
         event += ".approval.rejected";
         gs.eventQueue(event, current, current.state, previous.state);
         updateRecord(current, approvalComment, current.comments.getJournalEntry(-1), mayBeSystem);
         notifyMyFriends(current);
         break;
      case 'approved':
         updateRecord(current, approvalComment, current.comments.getJournalEntry(-1), mayBeSystem);
         break;
      default: 
   }
         
 }

function notifyMyFriends(me) {
   var friends = new GlideRecord('sysapproval_approver');
   friends.addQuery('document_id', me.document_id);
   friends.query();
   while(friends.next()) {
      if (friends.approver.toString() != me.approver.toString()) {
         gs.eventQueue(me.source_table + ".approval.rej.other", me, friends.approver);
      }
   }
}

function updateRecord(me, journal, comments, mayBeSystem) {
   var isWorkflow = false;
   var isProcessGuide = false;
   if (isFD) {
      if (gs.getProperty("com.glide.hub.flow.approval.history_comment", "true") != "true")
         return;
   }
   else {
      // only log the user approval activity for workflows when specifically turned on
      // otherwise, we spam the approval history log when it is almost never desired to track via the approval history journal field
      var isWorkflow = !current.wf_activity.nil();
      // if this is for a group approval, don't log this user action since the Group Approval Activity will handle the logging
      if (!current.group.nil())
         return;
      // only log the user approval activity for workflows when specifically turned on
      // otherwise, we spam the approval history log when it is almost never desired to track via the approval history journal field
      isWorkflow = !current.wf_activity.nil();
      if (isWorkflow && (gs.getProperty("glide.workflow.user_approval_history") != "true"))
         return;
      isProcessGuide = !current.process_step.nil();

   }

	if (comments)
		journal += "\n\n" + gs.getMessage("Approval comments") + ":\n" + comments;
	
	var approvingRecord = new GlideRecord(me.source_table);
	if (approvingRecord.get(me.document_id)) {
		if (isWorkflow || isProcessGuide)
			approvingRecord.setUseEngines(false);
		
		if (!me.approval_journal_column.nil()) {
			if (typeof approvingRecord[me.approval_journal_column].setJournalEntry === 'function') {
				approvingRecord[me.approval_journal_column].setJournalEntry(journal, mayBeSystem);
				approvingRecord.update();
				return;
			}
		}
		
		if (typeof approvingRecord.approval_history.setJournalEntry === 'function') {
			approvingRecord.approval_history.setJournalEntry(journal, mayBeSystem);
			approvingRecord.update();
			return;
		}
	}
}
