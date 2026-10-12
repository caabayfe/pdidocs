/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.setState('isAISEnabled', event.payload.isAISEnabled);
    api.setState('applyAIS', event.payload.applyAIS);
    api.setState('isTLEmpty', event.payload.isTLEmpty);
    api.setState('isPFEmpty', event.payload.isPFEmpty);
}
