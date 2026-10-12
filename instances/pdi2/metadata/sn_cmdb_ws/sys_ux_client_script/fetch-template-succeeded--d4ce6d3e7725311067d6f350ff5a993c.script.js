/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {

    let template = event.payload.data.output;
    
    // Overwrite error
    Object.keys(template).forEach((i) => {
        if(template[i] == "error")
            template[i] = "";
    });

    // fetch merged attributes for this class
    api.data.deduplication_get_merged_attributes_1.execute({
        'class': template.table
    });
    api.data.deduplication_template_get_related_items_1.execute({
        'class': template.table
    });
    api.setState('loading', false)
    api.setState('template',template);
}
