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
    if (event.elementId === 'button_6') {
        api.emit('NAV_ITEM_SELECTED', {
            route: 'filter-guided-setup',
            fields: {
                "filterId": event.context.item.value.filterId
            }
        });
    } else if (event.payload.actionItem.action === "EDIT_ACTION") {
        api.emit('NAV_ITEM_SELECTED', {
            route: 'filter-guided-setup',
            fields: {
                "filterId": event.payload.context.row.key
            }
        });
    } else if (event.payload.actionItem.action === "DEACTIVATE_ACTION") {
        api.setState("deactivatonFilterId", event.payload.context.row.key);
        api.setState("deactivatedFilterName", event.payload.context.row.cells.name.value);
    } 

}
