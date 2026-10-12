var LicensingCacheManager = Class.create();

/*
Any change in this class would invalidate the RCA that needs to be changes to "Allowed" again.
*/
LicensingCacheManager.prototype = {
    initialize: function() {
        this._cacheManager = new global.EntitlementCacheManager();
        this.LOGGER = new LoggingUtil();
    },

    getDataFromCache: function(catalog, cache) {
        return this._cacheManager.getDataFromCache(catalog, cache);
    },

    putDataIntoCache: function(catalog, cache, object) {
        if (gs.nil(object)) {
            this.LOGGER.logWarn("LicensingCacheManager", "putDataIntoCache", "Attempting to cache null or undefined for catalog: " + catalog + ", cache: " + cache);
        }
        
        if (typeof object === 'object') {
            var isEmpty = false;
            if (typeof object.size === 'number') {
                isEmpty = object.size === 0;
            } else if (Object.keys(object).length === 0) {
                isEmpty = true;
            }
            
            if (isEmpty) {
                this.LOGGER.logWarn(this.type, "putDataIntoCache", "Caching empty object/Map/Set for catalog: " + catalog + ", cache: " + cache);
            }
        }
        
        this._cacheManager.putDataIntoCache(catalog, cache, object);
    },

    flush: function(catalog) {
        this._cacheManager.flush(catalog);
    },

    type: 'LicensingCacheManager'
};
