(function executeRule(current, previous /*null when async*/) {
	
	g_scratchpad.isSharedProject = new global.ProminACLUtil(current).isSharedProject();
	if(g_scratchpad.isSharedProject) {
		gs.addInfoMessage(
			gs.getMessage("Since this project is shared with you, you have limited access to modify this definition")
		);
	}

})(current, previous);
