/**
 * Define logic to determine data access
 * @param {string} requestBody - requested data 
 * @returns {boolean} - true if the user has the correct access
 */
(function hasAccess(requestBody) {
    return [
        'sn_telemetry_data.observability_metric_viewer'
    ].some(role => gs.hasRole(role));
})(requestBody);
