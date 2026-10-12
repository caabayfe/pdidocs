(function executeRule(current, previous) {
	if(gs.getProperty("glide.instance.debug")=="true")
		g_scratchpad.debugMode = "true";
	else
		g_scratchpad.debugMode = "false";
})(current, previous);
