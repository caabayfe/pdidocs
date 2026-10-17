/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {
        targetRecord
    } = event.payload || {};
    if (targetRecord) {
        api.emit("NAV_ITEM_SELECTED", {
            external: {
                url: "/sc_cat_item.do?sys_id=" + targetRecord,
                inApp: true
                }
            });
        }
    }
