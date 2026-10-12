(function executeRule(current, previous /*null when async*/) {
	var pluginList = ["com.glide.hub.integrations", "com.glide.hub.integration.runtime"];
	gs.eventQueue('sn_dependentclient.check.dependent_apps', null, pluginList.join(","));
})(current, previous);
