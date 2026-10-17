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
    const value = event?.payload?.value[0];
    api.setState("selectedConditionFromModal", value);
    api.setState("modalSelectedState", [value]);
}
