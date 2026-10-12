var EntitlementCacheManager = Class.create();

EntitlementCacheManager.prototype = {
    initialize: function() {
        this.initPrivateCacheable("licensing_cache_catalog");
    },

    getDataFromCache: function(catalog, cache) {
        return GlideCacheManager.get(catalog, cache);
    },

    putDataIntoCache: function(catalog, cache, object) {
        GlideCacheManager.put(catalog, cache, object);
    },

    flush: function(catalog) {
        GlideCacheManager.flush(catalog);
    },

    initPrivateCacheable: function(name) {
        if (!name)
            return;
        if (GlideCacheManager.get(name, "_created_") != null)
            return;
        GlideCacheManager.addPrivateCacheable(name);
        GlideCacheManager.put(name, "_created_", new GlideDateTime().getNumericValue());
    },

    type: 'EntitlementCacheManager'
};
