(function executeRule(current, previous /*null when async*/) {
	GlideCacheManager.put('sys_aw_global_search_config_databroker_cache', current.getUniqueValue(), null);
})(current, previous);
