/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    let output = api.data.transform_base_agg_query.output;
    if (!output || Object.keys(output).length === 0) {
        return;
    }

    let tableName = Object.keys(output)[0];
    const customPayload = {
        route: "list",
        targetRoute: "current",
        fields: {
            table: tableName
        },
        params: {
            listTitle: output[tableName].label,
            query: output[tableName].encodedQuery
        }
    };

    api.emit('NAV_ITEM_SELECTED', customPayload);
    api.setState('selectedBaseAggQuery', '');
}
