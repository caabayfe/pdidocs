/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const combinedEncodedQuery = event.payload.combinedEncodedQuery;
    const encodedQuery = event.payload.encodedQuery;
    const fixedEncodedQuery = event.payload.fixedEncodedQuery;
    const fixedQueryMode = event.payload.fixedQueryMode;

    api.setState('combinedEncodedQuery', combinedEncodedQuery);
    api.setState('encodedQuery', encodedQuery);
    api.setState('fixedEncodedQuery', fixedEncodedQuery);
    api.setState('fixedQueryMode', fixedQueryMode);
}
