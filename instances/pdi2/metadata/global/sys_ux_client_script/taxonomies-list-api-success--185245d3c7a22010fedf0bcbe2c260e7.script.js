/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function handler({api, event, helpers, imports}) {
    const taxonomies = api.data.get_taxonomies.output.data.now.taxonomy.getTaxonomies;
    api.setState("taxonomies", taxonomies);
    if (taxonomies.length)
        api.setState("selectedTaxonomy", taxonomies[0].id);
}
