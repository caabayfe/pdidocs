/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {navigation} = event.payload.item;
    if(!navigation) 
        return;
    
    const {route='', params={}, fields={}} = navigation;
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
