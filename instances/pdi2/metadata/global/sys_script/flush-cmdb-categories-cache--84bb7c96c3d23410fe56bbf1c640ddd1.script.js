(function executeRule(current, previous /*null when async*/) {

	//Flush cache used in CMDBItem script include
	GlideCacheManager.flush('CMDB_CATEGORIES_CACHE');

})(current, previous);
