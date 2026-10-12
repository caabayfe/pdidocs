(function executeRule(current, previous /*null when async*/) {

	if (current.name != previous.name) {
		var liveGroupProfile = new GlideRecord("live_group_profile");
		liveGroupProfile.addQuery("table", "vtb_board");
		liveGroupProfile.addQuery("document", current.sys_id);
		liveGroupProfile.query();
		
		if (liveGroupProfile.next()) {
				liveGroupProfile.setValue("name", current.name);
				liveGroupProfile.update();
		}
	}

})(current, previous);
