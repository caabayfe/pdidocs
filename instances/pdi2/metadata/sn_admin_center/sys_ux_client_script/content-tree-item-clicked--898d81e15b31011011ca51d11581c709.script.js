/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {route='', params={}, fields={}} = event.payload.item.navigation;
    api.emit("NAV_ITEM_SELECTED", {
        route: route,
        fields: fields,
        params: params,
        redirect: "",
        passiveNavigation: "",
        title: "",
        multiInstField: "",
        external: "",
    });
}
