(function executeRule(current, previous /*null when async*/ ) {
    var conversationalCatalogCache = 'is_catalog_conversational_cache';
    GlideCacheManager.remove(conversationalCatalogCache, current.sys_id);

})(current, previous);
