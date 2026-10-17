/**
 * Define logic to generate a key from the request
 * @param {string} requestBody - requested data 
 * @returns {string} - The key
 */
(function getKey(requestBody) {
    const key = new sn_uxa_req_manager.UXAUtils().generateCacheKey(requestBody);
    return key;
})(requestBody);
