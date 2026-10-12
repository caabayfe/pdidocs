(function executeRule(current, previous /*null when async*/) {
	if (current.name != previous.name) {
		var sysUser = new GlideRecord("sys_user");
		sysUser.addQuery("sys_id", current.sys_id);
		sysUser.query();
		
		var liveProfile = new GlideRecord("live_profile");
		liveProfile.addQuery("document", current.sys_id);
		liveProfile.query();
		
		if(sysUser.next() && liveProfile.next()) {
			liveProfile.name = sysUser.name;
			liveProfile.update();	
		}
	}

})(current, previous);
