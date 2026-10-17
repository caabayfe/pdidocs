/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {

    api.setState('viewLegacyScores',event.payload.value );
    api.data.set_legacy_score_enabled.execute({
        "enabled": event.payload.value
    });
    
}
