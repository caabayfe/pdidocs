/**
 * Define logic to determine data access
 * @param {string} requestBody - requested data 
 * @returns {boolean} - true if the user has the correct access
 */
(function hasAccess(requestBody) {
    return [
        'chat_analytics_viewer',
        'mobile_analytics_viewer',
        'portal_analytics_viewer',
        'core_ui_analytics_viewer',
        'now_experience_analytics_viewer'
    ].some(role => gs.hasRole(role));
})(requestBody);
