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
    if (event.payload.item.id !== null) {
        api.setState('selectedProcessTable', event.payload);
        api.setState('errorMessage', null);
        api.setState('inputInvalid', false);
        if (event.payload.item.tableName) {
            api.data.check_if_table_has_content_pack.refresh();
        } else {
            api.setState('tableHasContentPack', false);
            api.setState('startWithTemplate', false);
        }
    }
}
