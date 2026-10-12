/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.emit("MACROPONENT_VIEWPORT_LOAD_REQUESTED", {
        viewportElementId: 'viewport_1',
        route: event.payload.route,
        fields: event.payload.fields,
        params: event.payload.params
    });
}
