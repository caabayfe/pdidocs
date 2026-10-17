var PassThroughScopedCache = Class.create();
PassThroughScopedCache.prototype = {
    initialize: function(obj, cacheName) {
        this._obj = obj;
        this._createPassThroughFunctions(obj);
        this._cacheName = cacheName;
        this._cacheManager = sn_scoped_cache.ScopedCacheManager;
    },

    /**
     * @param {string} funcName The function name to cache
     * @param {func} cacheKeyProviderFunc If provided, it should provide the cache key to be used. If not, the cache key defaults to the function name + parameters
     * @param {func} readCachePredicateFunc Function that returns true/false. If true, the cached value is returned. If false, the non-cached value is read.
     * @param {func} writeCachePredicateFunc Function that returns true/false. If true and a cached value does not exist, one is written. If false, no cache value is written.
     */
    registerCacheFunction(funcName, cacheKeyProviderFunc, readCachePredicateFunc, writeCachePredicateFunc) {
        this[funcName] = (...funcParameters) => {
            const cacheKey = cacheKeyProviderFunc ?
                cacheKeyProviderFunc(funcParameters[0]) :
                `${funcName}(${JSON.stringify(funcParameters)})`;

            if (!readCachePredicateFunc || readCachePredicateFunc(...funcParameters)) {
                const cachedVal = this._cacheManager.get(this._cacheName, cacheKey);
                if (cachedVal != null && cachedVal != undefined)
                    return cachedVal;
            }

            const calculatedVal = this._obj[funcName](...funcParameters);

            if (!writeCachePredicateFunc || writeCachePredicateFunc(...funcParameters))
                this._cacheManager.put(this._cacheName, cacheKey, String(calculatedVal));

            return calculatedVal;
        };
    },

    /**
     * Flushes the cached values
     */
    flushCache() {
        this._cacheManager.flushScopedCache(this._cacheName);
    },

    /**
     * Wires up functions on this object that mirror the public functions
     * on the provided 'obj'
     *
     * @param obj The object to add caching to
     */
    _createPassThroughFunctions: function(obj) {
        this._getPublicFunctionNames(obj)
            .forEach(functionName => this._addPassThroughFunction(obj, functionName));
    },

    /**
     * Retrieves an array of public function names from the obj
     *
     * @param obj The object to get the public function names from
     * @returns {string[]} An array of function names
     */
    _getPublicFunctionNames: function(obj) {
        if (!obj)
            return [];

        // Note: Object.getOwnPropertyNames(obj) does not seem to work in Rhino presently
        //   It just silently fails and returns and empty array. So keys have to be enumerated
        //   like this.
        const keys = [];
        for (const key in obj)
            keys.push(key);

        // Reduce the keys down to the ones that are functions and aren't a constructor or private
        return keys
            .filter(key => typeof obj[key] === 'function')
            .filter(key => key.toLowerCase() !== 'initialize')
            .filter(key => key.toLowerCase() !== 'constructor')
            .filter(key => !key.startsWith('_'));
    },

    /**
     * Adds a pass through call to obj.func(parameters)
     *
     * @param obj The object that has the results being cached
     * @param funcName Name of the function to create
     */
    _addPassThroughFunction: function(obj, funcName) {
        this[funcName] = (...funcParameters) => {
            return obj[funcName](...funcParameters);
        };
    },

    type: 'PassThroughScopedCache'
};

PassThroughScopedCache.flushCacheByName = function(cacheName) {
    sn_scoped_cache.ScopedCacheManager.flushScopedCache(cacheName);
};
