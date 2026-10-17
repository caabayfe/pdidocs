var NowAssistCacheUtil = Class.create();
NowAssistCacheUtil.prototype = {
    initialize: function() {
        this.SCOPED_CACHE_UTIL = sn_scoped_cache.ScopedCacheManager;
        this.CACHE_PREFIX = 'sn_nowassist_admin_';
        this.CACHE_CATALOG_NAME = 'nowassist_admin';
        this.STORES = ['CONFIG', 'APPLICABILITY','ASSET_SUBSCRIPTION'];
        this.CACHING_ENABLED = gs.getProperty('sn.now.assist.caching.enabled', true).toString();
    },
    _isCachingEnabled: function() {
        return this.CACHING_ENABLED && this.CACHING_ENABLED.toLowerCase() === 'true';
    },
    /**
     * Generates a cache key based on the provided parameters.
     * @param {string} store - The store identifier.
     * @param {string} keyId - The key id.
     * @param {string} [domainSysId=global] - The domain sys_id.
     * @returns {string|null} The generated cache key or null if input is invalid.
     * @private
     */
    _generateCacheKey: function(store, keyId, domainSysId) {
        if (!store || !keyId || this.STORES.indexOf(store) === -1) {
            return null;
        }
        return this.CACHE_PREFIX + store + '_' + keyId + '_' + (domainSysId || 'global');
    },


    /**
     * Flushes the specified cache or the entire cache catalog.
     *
     * @function
     * @param {string|null} store - The store identifier.
     * @param {string|null} keyId - The key id.
     * @returns {boolean} True if the cache flush was successful, false otherwise.
     * @throws {Error} If an error occurs while attempting to flush the cache.
     */
     flushNACache: function(store, keyId) {
        if (!this._isCachingEnabled()) return null;
        var key = null;
        try {
            if (store) key = this.CACHE_PREFIX + store + '_';
            if (keyId) key += keyId + '_';
            if (this.SCOPED_CACHE_UTIL.prefixFlush) {
                this.SCOPED_CACHE_UTIL.prefixFlush(this.CACHE_CATALOG_NAME, key || this.CACHE_PREFIX);
                return true;
            } else {
                return false;
            }
        } catch (e) {
            return false;
        }
    },


    /**
     * Retrieves a value from the cache.
     * @param {string} store - The store identifier.
     * @param {string} [domainSysId=global] - The domain sys_id.
     * @param {string} keyId - The key id.
     * @returns {*} The cached value associated with the provided parameters, or null if not found.
     */
    getNACache: function(store, domainSysId, keyId) {
        try {
            domainSysId = domainSysId || 'global';
            if (!this._isCachingEnabled()) return null;
            var key = this._generateCacheKey(store, keyId, domainSysId);
            if (!key) return null;
            return JSON.parse(this.SCOPED_CACHE_UTIL.get(this.CACHE_CATALOG_NAME, key));
        } catch (e) {
            return null;
        }
    },


    /**
     * Sets a value in the cache.
     * @param {string} store - The store identifier.
     * @param {string} [domainSysId=global] - The domain sys_id.
     * @param {string} keyId - The key id.
     * @param {*} value - The value to be cached.
     * @param {*} alternateKeyId - Optional. alternateKeyId to be used for generating the key instead of the keyId.
     * @returns {*} The cached value that was set, or null if the operation failed.
     */
    setNACache: function(store, domainSysId, keyId, value, alternateKeyId) {
        domainSysId = domainSysId || 'global';
        if (!this._isCachingEnabled()) return null;
        var key = this._generateCacheKey(store, alternateKeyId || keyId, domainSysId);
        if (!key) return null;
        this.SCOPED_CACHE_UTIL.putRow(this.CACHE_CATALOG_NAME, key, JSON.stringify(value), keyId);
        return true;
    },


    type: 'NowAssistCacheUtil'
};
