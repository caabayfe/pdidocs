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
    if (event.name == "NOW_LIST#CELL_LINK_CLICKED") {
        var action = event.payload.context.columnKey;
        var sysId = event.payload.context.row.key;
        if (action == "accept" || action == "deny") {
            api.data.sow_my_approval_update_request_item_state.execute({
                'action': action,
                'sysId': sysId
            });
            api.data.sow_my_approval_request_table_layout.refresh();

        } else if (action == "ritmNumber") {
            api.emit('NAV_ITEM_SELECTED', {
                "route": "record",
                "fields": {
                    "table": "sc_req_item",
                    "sysId": sysId
                }
            });
        }
    }
}
