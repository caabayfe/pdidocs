/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var dropdownId = event.payload.item.id;
    if (dropdownId == "view_configuration") {
        api.emit('NAV_ITEM_SELECTED', {
            external: {
                url: 'sys_one_extend_capability.do?sys_id=853f0b7243d4f1106ccb3fc9dbb8f251'
            }
        });
    }
    if (dropdownId == "view_permissions") {
        api.emit('NAV_ITEM_SELECTED', {
            external: {
                url: 'now/conversation/settings/sidebar-suggestions-permission'
            }
        });
    }
}
