(function executeRule(current, previous /*null when async*/) {

	var should_isolate = gs.getProperty("glide.script.block.client.globals", "true");
	if (should_isolate == "true")
		current.setValue("isolate_script", true);

})(current, previous);
