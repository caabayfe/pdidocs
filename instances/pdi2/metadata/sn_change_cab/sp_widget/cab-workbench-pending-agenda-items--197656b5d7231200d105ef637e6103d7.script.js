(function() {
	data.meetingId = $sp.getParameter("sys_id");
	data.userId = gs.getUserID();
	
	data.i18n = {
		item: {
			state: {
				pending: gs.getMessage('Change {0} pending'),
				in_progress: gs.getMessage('Change {0} current active agenda'),
				paused: gs.getMessage('Change {0} paused'),
				approved: gs.getMessage('Change {0} approved'),
				preapproved: gs.getMessage('Change {0} preapproved'),
				rejected: gs.getMessage('Change {0} rejected'),
				no_decision: gs.getMessage('Change {0} with no decision'),
				permissionDenied: gs.getMessage('You are not allowed to view this Agenda Item')
			},
			select: gs.getMessage('Select agenda item for Change {0}'),
			notify: gs.getMessage('Notify me when Change {0} is due'),
			timer: gs.getMessage('Agenda item {0}'),
			promote: gs.getMessage('Promote Change {0}'),
			restore: gs.getMessage('Restore Change {0} to Pending')
		},
		filter: {
			all: gs.getMessage('All Agenda Items'),
			approved: gs.getMessage('Approved Agenda Items'),
			mine: gs.getMessage('My Agenda Items'),
			pending: gs.getMessage('Pending Agenda Items'),
			complete: gs.getMessage('Complete Agenda Items')
		},
		paging: {
			"next": gs.getMessage("Next Page"),
			"top": gs.getMessage("First Page"),
			"prev": gs.getMessage("Previous Page")
		}
	};
})();
