/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const hasIHProtocolRecords = api.data.has_ih_protocol.output.data.GlideRecord_Query.sku_metadata._rowCount !== 0;
    api.setState('hasIHProtocolRecords', hasIHProtocolRecords);
}
