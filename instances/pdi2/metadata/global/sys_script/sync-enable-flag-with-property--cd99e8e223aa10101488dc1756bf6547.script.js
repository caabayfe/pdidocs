(function executeRule(current, previous /*null when async*/) {

	gs.setProperty("com.snc.change_request.enable_unauthorized", current.enable_event);

})(current, previous);
