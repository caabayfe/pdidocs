(function executeRule(current, previous /*null when async*/) {

	GlideCacheManager.prefixFlush("scriptable_table_data_cache", current.table + "-");
	GlideCacheManager.prefixFlush("scriptable_table_data_row_cache", current.table + "-");
	GlideCacheManager.prefixFlush("scriptable_table_data_file_cache", current.table + "-");

	if (current.table != previous.table) {
		GlideCacheManager.prefixFlush("scriptable_table_data_cache", previous.table + "-");
		GlideCacheManager.prefixFlush("scriptable_table_data_row_cache", previous.table + "-");
		GlideCacheManager.prefixFlush("scriptable_table_data_file_cache", previous.table + "-");
	}
	
})(current, previous);
