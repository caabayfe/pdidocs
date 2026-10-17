(function executeRule(current, previous /*null when async*/) {

	GlideWhiteListManager.get().removeFromJellyGlobalAllowlist(current.classname, current.membername);
	GlideClusterMessage.post("script", "GlideWhiteListManager.get().removeFromJellyGlobalAllowlist('" + current.classname + "', '" + current.membername + "');");
   

})(current, previous);
