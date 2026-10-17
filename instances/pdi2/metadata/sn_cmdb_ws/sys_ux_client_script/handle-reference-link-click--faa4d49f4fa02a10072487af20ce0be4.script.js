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
        handleReferenceLinkClick,
    } = imports["sn_cmdb_ws.ExploreCIUtils"](...arguments);
    const { table, sys_id: sysid } = event.payload;
    let {
        listId,
        url
    } = api.state.modalListMetadata;
    if (event.elementId == 'modal_list' && listId == 'related_items_list' && url) {
        url = url
            .replace("${table}", table)
            .replace("${sysid}", sysid);
        helpers.navigate.to(
            null,
            null,
            null,
            false,
            false,
            null, {
                url: url
            }
        );
    } else {
        handleReferenceLinkClick(event);
    }
}
