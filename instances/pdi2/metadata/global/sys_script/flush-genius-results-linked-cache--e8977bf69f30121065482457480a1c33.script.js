(function executeRule(current, previous /*null when async*/) {

	GlideCacheManager.flush('search_context_config_gr_linked');
	GlideCacheManager.flush('search_context_config_synth_gr_linked_cache');
	GlideCacheManager.flush('filter_gr_by_source_for_sac_cache');

})(current, previous);
