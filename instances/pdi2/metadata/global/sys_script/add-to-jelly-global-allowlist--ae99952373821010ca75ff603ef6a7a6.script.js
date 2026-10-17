(function executeRule(current, previous /*null when async*/) {

	if (current.operation() == "update") {
        GlideWhiteListManager.get().removeFromJellyGlobalAllowlist(previous.classname, previous.membername);
	}

	GlideWhiteListManager.get().addToJellyGlobalAllowlist(current.classname, current.membername);
	GlideClusterMessage.post("allowlist", "ReloadJellyGlobal");

})(current, previous);
