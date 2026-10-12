/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    helpers.navigate.setRouteParams({
        params: { findingDefId: event.payload.findingDefId },
    });

    api.setState('selectedStep', 'CONFIGURE');
}
