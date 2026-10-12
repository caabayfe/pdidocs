// Clear all the top request caches
var CACHE_NAME = "ZZ_DYNAMIC_CATEGORY_CACHE_YY";
var keys = GlideCacheManager.getPrivateKeys(CACHE_NAME);
while (keys !== null && keys.hasNext()) {
	var key = keys.next();
	GlideCacheManager.remove(CACHE_NAME, key);
}

// Build the cache again
var gr = new GlideRecord("sc_category_top_n");
gr.addQuery("type", "sc_req_item");
gr.query();
while (gr.next()) {
	var category = GlideappCategory.get(gr.getUniqueValue());
  category.getItems(); // This will build the cache
}
