/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    let hasRels = false;
    let relTreeOutput = api.data.get_relationship_tree_1.output;
    if (relTreeOutput && relTreeOutput.items && relTreeOutput.items.length > 0)
        hasRels = true;
    api.setState('hasRelationships', hasRels);
}
