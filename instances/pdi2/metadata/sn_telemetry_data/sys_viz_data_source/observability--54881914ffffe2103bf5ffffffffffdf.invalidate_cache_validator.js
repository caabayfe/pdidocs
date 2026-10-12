/**
 * Define logic for when the cache should be invalidated
 * @param {string} requestBody - requested data 
 * @param {boolean} lastCacheTime - last time the cache was updated
 * @param {boolean} refresh - whether cache should be invalidated or not
 * @returns {boolean} - true if the cache should be invalidated
 */
(function shouldInvalidateCache(lastCacheTime, refresh) {
    return refresh;
})(lastCacheTime, refresh);
