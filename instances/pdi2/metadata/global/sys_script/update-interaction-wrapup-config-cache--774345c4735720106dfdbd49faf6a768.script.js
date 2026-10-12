(function executeRule(current, previous /*null when async*/) {

	var cacheKey = "interaction_wrap_up_configuration";
	var wrapup_configs = GlideCacheManager.get("WRAP_UP_CONFIGURATION_CACHE", "interaction_wrap_up_configuration");
	if(!gs.nil(wrapup_configs)) {
		new AWALoggingUtils().atInfo(current).log("Flushing WRAP_UP_CONFIGURATION_CACHE cache entry");
		GlideCacheManager.flush("WRAP_UP_CONFIGURATION_CACHE");
	}

})(current, previous);
