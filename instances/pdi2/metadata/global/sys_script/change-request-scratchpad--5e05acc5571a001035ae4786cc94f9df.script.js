(function executeRule(current, previous /*null when async*/ ) {
	var preference = gs.getUser().getPreference("change_request.show_conflict_message");
    g_scratchpad.show_conflict_message = {
		"property": gs.getProperty("change.conflict.show_conflict_message", "user"),
		"preference": preference + "" !== "false"
	};
})(current, previous);
