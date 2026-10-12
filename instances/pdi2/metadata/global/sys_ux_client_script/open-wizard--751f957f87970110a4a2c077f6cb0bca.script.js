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
    api.emit("NAV_ITEM_SELECTED", {
        external: {
            url: "/now/configuration/iar/wizard/e06b0afdeb7281102b57e53069522852/params/record-id/" + api.state.selected_record[0].sys_id,
            target: "_self"
        }
    });
}
