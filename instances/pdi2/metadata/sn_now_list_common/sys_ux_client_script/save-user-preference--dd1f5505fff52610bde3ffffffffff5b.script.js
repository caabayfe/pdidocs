/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
 api.data.save_user_preference_1.execute({
        "name": "list_bundle_preferred_visualization_type",
        "value": api.state.visualizationType
    });
}
