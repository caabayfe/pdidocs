(function () {
	data.meetingId = $sp.getParameter("sys_id");
	data.userId = gs.getUserID();

	data.i18n = {
		"dialog" : {
			"shown": gs.getMessage("{0} dialog shown. Use F6 to switch to it."),
			"hidden": gs.getMessage("{0} dialog hidden")
		},
		"header" : {
			"title" : gs.getMessage("CAB Header Widget")
		},
		"timer": {
			"title": gs.getMessage("CAB Meeting"),
			"scheduled_for": gs.getMessage("Scheduled {0} minutes")
		},
		"dialogTitle": {
			"cab-meeting-notes": gs.getMessage("Meeting Notes"),
			"cab-attendees": gs.getMessage("Attendees"),
			"cab-conference-info": gs.getMessage("Conference Information")
		},
		"meeting" : {
			"cancelled" : gs.getMessage("This meeting has been cancelled")
		}
	};
	
	data.widgetDef = {
		"cab-meeting-notes": $sp.getWidget("cab-meeting-notes", {}),
		"cab-attendees": $sp.getWidget("cab-attendees", {})
	};
})();
