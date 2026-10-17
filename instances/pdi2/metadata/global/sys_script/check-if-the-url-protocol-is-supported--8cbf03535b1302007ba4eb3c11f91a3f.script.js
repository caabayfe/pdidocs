(function executeRule(current, previous /*null when async*/) {
   
	if (gs.getProperty("glide.installation.developer", "false") == "true") {
		gs.log("Unsupported URL. The URL must start with http, https or file");
		current.url.setError(gs.getMessage("Unsupported URL. The URL must start with http, https or file"));
	} else {
		gs.log("Unsupported URL. The URL must start with http or https");
		current.url.setError(gs.getMessage("Unsupported URL. The URL must start with http or https"));
	}
	current.setAbortAction(true);

})(current, previous);
