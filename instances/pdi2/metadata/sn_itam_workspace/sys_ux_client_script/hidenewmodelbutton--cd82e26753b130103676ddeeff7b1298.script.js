/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    const canCreate = api.data.table_access_transform_1.output.canCreate;
    if (parseInt(event.payload.selectedTabIndex,10) > 0 || !canCreate) {
        api.setState('hideNewModelBtn', true);
    } else {
        api.setState('hideNewModelBtn', false);
    }
}
