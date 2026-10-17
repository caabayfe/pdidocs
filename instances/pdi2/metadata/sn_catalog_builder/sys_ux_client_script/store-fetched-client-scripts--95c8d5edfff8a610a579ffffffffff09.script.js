/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {queryRows} = event.payload.model.layoutQuery;
    api.setState('clientListRows', queryRows);
    api.setState('listCount', queryRows.size);
}
