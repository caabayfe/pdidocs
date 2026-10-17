/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const hasBundledItemsRecords = api.data.has_bundled_Items.output.data.GlideRecord_Query.subscription_detail._rowCount !== 0;
    api.setState('hasBundledItemsRecords', hasBundledItemsRecords);
}
