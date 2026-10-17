function transform(input) {
	// TODO: need to verify with PM if we want to continue the email notifications on reassign
	// 	if (gr.update()) {
	// 		var usersList = util.getUsersWithDataManagerAdminRole();
	// 		if (gs.hasRole("maint") || gs.hasRole("data_manager_admin")) {
	// 			assignmentInfo.isCurrentUserDMAdmin = true;
	// 		}
	// 		if (input.assignmentGroup === '' && input.assignee === '') { // SEND TO ADMIN case
	// 			gs.eventQueue(util.NOTIFICATION_EVENTS.TASK_SEND_TO_ADMIN, gr, usersList.toString(), JSON.stringify(assignmentInfo));
	// 		} else if (input.assignee !== '' && input.assignee !== gs.getUserID()) {
	// 			gs.eventQueue(util.NOTIFICATION_EVENTS.TASK_REASSIGN, gr, input.assignee.toString(), JSON.stringify(assignmentInfo));
	// 		}
	// 	}

	var wrapperFn = function() {
		var taskIds = input.sysIds;
		var assignee = input.assignee;
		var assignmentGroup = input.assignmentGroup;
		var comments = input.comments;

		var proxy = new sn_cmdb_ws.CMDBWsDMTaskUIProxy();
		taskIds.forEach(function(taskId) {
			proxy.reassignTask(taskId, assignmentGroup, assignee, comments);
		});
	};

	return new sn_cmdb_ws.CMDBWsDataBrokerHandler().execute("sn_cmdb_ws_dm", "Update DM task assignments", wrapperFn);
}
