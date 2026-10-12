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
        targetRecord
    } = event.payload || {};

    if (targetRecord) {
        api.emit("NAV_ITEM_SELECTED", {
            route: null,
            fields: null,
            params: null,
            redirect: null,
            passiveNavigation: null,
            title: null,
            multiInstField: null,
            targetRoute: null,
            external: {
                url: "/sc_cat_item.do?sys_id=" + targetRecord
            }
        });

        api.emit("NAV_ITEM_SELECTED", {
            route: "home",
            title: "Service Catalog Builder",
            redirect: true,
            reload: true
        });
    }
}
