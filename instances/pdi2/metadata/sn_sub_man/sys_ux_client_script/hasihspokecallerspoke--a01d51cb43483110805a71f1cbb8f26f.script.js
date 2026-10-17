/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const hasIHSpokeCallerSpokeRecords = api.data.has_ih_spoke_caller_spoke.output.data.GlideRecord_Query.sku_metadata._rowCount !== 0;
    api.setState('hasIHSpokeCallerSpokeRecords', hasIHSpokeCallerSpokeRecords);
}
