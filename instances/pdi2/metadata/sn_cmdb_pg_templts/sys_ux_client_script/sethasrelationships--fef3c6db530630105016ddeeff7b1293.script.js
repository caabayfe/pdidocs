/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    let hasRels = false;
    let relTreeOutput = api.data.get_cmdb_service_relationship_1.output;
    if (relTreeOutput && relTreeOutput.tree && relTreeOutput.tree.length > 0)
        hasRels = true;
    api.setState('hasRelationships', hasRels);
}
