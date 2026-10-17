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
    if (event.name === "NOW_RECORD_LIST_CONNECTED#ROW_CLICKED") {
        api.setState('edit_GS', true);
        api.setState('clicked_GS_ID', event.payload.sys_id)
        api.data.get_user_domain_1.refresh();
    }

    if (event.payload.wrappedAction === "CREATE_NEW_RECORD") {
        api.setState('create_GS', true);
        api.data.get_user_domain_1.refresh();
    }

}
