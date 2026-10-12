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
        state,
        data
    } = api;
    if (!state.selectedRecords || !state.selectedRecords.sysIds)
        return;

    data.delete_ui_policy_resource.execute({
        ui_policy_ids: state.selectedRecords.sysIds
    });
}
