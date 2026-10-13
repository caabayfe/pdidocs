/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    const {dotWalkMetadata, fieldOperatorRelationships} = api.data.get_cb_metadata.output;
    api.setState('dotWalkMetadata', dotWalkMetadata);
    api.setState('fieldOperatorRelationships', fieldOperatorRelationships);
}
