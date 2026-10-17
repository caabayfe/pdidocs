/**
 * Team details handler
 * 
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
    const payload = {
        name: event.name,
        elementId: event.elementId,
        payload: event.payload
    };
    if (event.name === 'NOW_CARD#CLICKED') {
        const { _row_data: { uniqueValue: sysId }} = event.context.item.value;
        api.emit('NAV_ITEM_SELECTED', {
            "route": "record",
            "fields": {
                "table": "sys_user_group",
                "sysId": sysId
            }
        });
    } else if (event.name === 'NOW_CARD_HEADER#ACTION_CLICKED') {
        if (event.payload.action.id == 'open') {
            const { _row_data: { uniqueValue: sysId }} = event.context.item.value;
            api.emit('NAV_ITEM_SELECTED', {
                "route": "record",
                "fields": {
                    "table": "sys_user_group",
                    "sysId": sysId
                }
            });
        }
    }
}
