/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    const eventName = "NOW_UXF_PAGE#REMOVE_NOTIFICATIONS";
    const alertIds = ["record_not_available_alert", "advanced_script_alert", "time_limited_role_alert"];
    const alertItems = alertIds.map(alertId => ({id: alertId}));
    api.emit(eventName, {items: alertItems});
}
