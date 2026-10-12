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
    const slaVisibilityMap = {};
    const result = event.payload.data.output.data.snPo.GlidePromin.prominIsSlaVisible.result;
    for (const obj of result) {
        slaVisibilityMap[obj['table']] = obj['visible'];
    }
    api.setState('slaVisibilityMap', slaVisibilityMap);
}
