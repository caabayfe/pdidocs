(function executeRule(current, previous /*null when async*/) {
	/* Removing a member from the group removes them from the vtb board */
	if (current.state == "inactive") {
		var liveGroupProfile = new GlideRecord("live_group_profile");
		liveGroupProfile.addQuery("sys_id", current.group);
		liveGroupProfile.addQuery("table", "vtb_board");
		liveGroupProfile.query();
		
		if (liveGroupProfile.next()) {
			var liveProfile = new GlideRecord("live_profile");
			liveProfile.addQuery("sys_id", current.member);
			liveProfile.query();
			if (liveProfile.next()) {
				var vtbMember = new GlideRecord("vtb_board_member");
				vtbMember.addQuery("user", liveProfile.document);
				vtbMember.addQuery("board", liveGroupProfile.document);
				vtbMember.query();
				if (vtbMember.next()) {
					vtbMember.deleteRecord();
				}
			}
		}
	}

})(current, previous);
