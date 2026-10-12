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
    const {
        id,
        name
    } = event.context.item.value;
    api.setState("selectedIndicatorId", id);
    api.setState("selectedIndicatorName", name);
}
