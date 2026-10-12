/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    var description = api.state.description;

    api.emit("NAV_ITEM_SELECTED", { route: "sensitive-data", reload: true, params:{
        recordAlert: false,
        recordType: "editRecord",
        recordName: description
    }});
}
