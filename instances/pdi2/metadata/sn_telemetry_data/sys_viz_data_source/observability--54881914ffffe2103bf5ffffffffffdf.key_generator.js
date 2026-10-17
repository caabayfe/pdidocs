/**
 * Define logic to generate a key from the request
 * @param {string} requestBody - requested data 
 * @returns {string} - The key
 */
(function getKey(requestBody) {
    const key = new sn_telemetry_data.TelemetryUtils().generateCacheKey(requestBody);
    return key;
})(requestBody);
