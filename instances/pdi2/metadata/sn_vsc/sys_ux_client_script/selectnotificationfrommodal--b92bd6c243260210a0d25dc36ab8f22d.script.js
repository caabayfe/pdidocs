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
    const value = event?.payload?.value;
    if (value && value.length) {
      api.setState("selectedNotificationFromModal", value[0]);
      api.setState("modalNotificationSelectedState", [value[0]]);
    }
    
}
