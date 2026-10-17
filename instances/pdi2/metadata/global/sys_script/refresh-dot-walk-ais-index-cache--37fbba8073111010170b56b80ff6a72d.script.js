(function executeRule(current, previous /*null when async*/) {
	GlideCacheManager.flush('cascade_update_table_name_to_fields_simple_cache_key');
    GlideCacheManager.flush('cascade_update_table_name_to_fields_descriptor_cache_key');

})(current, previous);
