/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const {
        touchPointEnabled,
        idleTimeEnabled
    } = api.item.value;

    return (!touchPointEnabled && !idleTimeEnabled);
}
