function script({api, event}) {  
    var taxonomies = api.data.get_taxonomies.output.data.now.taxonomy.getTaxonomies;
    api.setState("taxonomies", taxonomies);
    if(taxonomies.length && !api.state.selectedTaxonomy)
        api.setState("selectedTaxonomy", taxonomies[0].id);
}
