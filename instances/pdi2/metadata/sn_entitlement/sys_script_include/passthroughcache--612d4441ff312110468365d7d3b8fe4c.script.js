/**
 * This class provides fairly naive caching capabilities for the passed in object.
 * It mirrors the public functions on the provided object and stores the results
 * from calling through to the provided object in a local in-memory cache and
 * reuses this data for subsequent calls to this PassThroughCache instead of
 * making additional calls to the passed in object. These cache results are
 * retained for the life of this PassThroughCache object.
 */
var PassThroughCache = Class.create();
PassThroughCache.prototype = {

    /**
     * @param obj The object to add caching to
     */
    initialize: function(obj) {
        this._resultCache = new Map();
        this._createPassThroughCacheFunctions(obj);
    },

    /**
     * Wires up functions on this object that mirror the public functions
     * on the provided 'obj'
     *
     * @param obj The object to add caching to
     */
    _createPassThroughCacheFunctions: function(obj) {
        this._getPublicFunctionNames(obj)
            .forEach(functionName => this._addPassThroughCacheFunction(obj, functionName));
    },

    /**
     * Retrieves an array of public function names from the obj
     *
     * @param obj The object to get the public function names from
     * @returns {string[]} An array of function names
     */
    _getPublicFunctionNames: function(obj) {
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
     * Adds a pass through cache function that calls obj.func(parameters) and caches the result for each
     * unique set of parameters.
     *
     * @param obj The object that has the results being cached
     * @param funcName Name of the function to create
     */
    _addPassThroughCacheFunction: function(obj, funcName) {
        this[funcName] = (...funcParameters) => {
            // Build a complex key based on the arguments, so each unique set of arguments gets its results cached
            const cacheKey = `${funcName}(${JSON.stringify(funcParameters)})`;
            if (!this._resultCache.has(cacheKey))
                this._resultCache.set(cacheKey, obj[funcName](...funcParameters));
            return this._resultCache.get(cacheKey);
        };
    },

    type: 'PassThroughCache'
};
