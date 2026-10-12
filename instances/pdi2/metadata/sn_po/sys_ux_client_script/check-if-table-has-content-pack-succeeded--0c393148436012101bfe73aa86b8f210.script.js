/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const results = api.data.check_if_table_has_content_pack.results;

    const showContentPackOption = Boolean(Array.isArray(results) && results.length > 0);

    api.setState('tableHasContentPack', showContentPackOption);
    api.setState('startWithTemplate', showContentPackOption);
}
