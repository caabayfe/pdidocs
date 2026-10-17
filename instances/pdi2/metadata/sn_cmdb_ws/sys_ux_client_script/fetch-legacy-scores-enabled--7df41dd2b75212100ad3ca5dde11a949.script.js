/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {

    let results = api.data.get_legacy_scores_enabled.output;
    api.setState('viewLegacyScores',results);

}
