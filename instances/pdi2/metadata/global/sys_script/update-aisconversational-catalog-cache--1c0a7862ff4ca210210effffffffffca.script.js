(function executeRule(current, previous /*null when async*/) {

	var conversationalCatalogCache = 'is_catalog_conversational_cache';
	GlideCacheManager.remove(conversationalCatalogCache, current.catalog_item.sys_id);

	if (current.catalog_item.sys_id != previous.catalog_item.sys_id) {
		GlideCacheManager.remove(conversationalCatalogCache, previous.catalog_item.sys_id);

	}

})(current, previous);
