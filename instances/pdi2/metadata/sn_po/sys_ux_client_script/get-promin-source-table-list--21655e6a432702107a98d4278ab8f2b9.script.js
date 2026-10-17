/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.setState('isSourceDataLoaderDisabled', false);
    api.data.get_table_list_1.execute({
        sourceType: "TABLE",
        searchTerm: api.state.configTableSearchTerm
    });
}
