/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {

    let template = JSON.parse(JSON.stringify(api.state.template));
    let selected = Array.prototype.map.call(event.payload, i => i[0].id).toString();
    switch (api.state.selectedAttributeType) {
        case "newest_updated":
            template.newest_updated_merge_attributes = selected;
            break;
        case "oldest_created":
            template.oldest_created_merge_attributes = selected;
            break;
        case "most_relations":
            template.most_relations_merge_attributes = selected;
            break;
        case "most_related_items":
            template.most_related_items_merge_attributes = selected;
            break;
    }

    let newest_updated_merge_attributes_count = template.newest_updated_merge_attributes ? template.newest_updated_merge_attributes.split(",").length : 0;
    let oldest_created_merge_attributes_count = template.oldest_created_merge_attributes ? template.oldest_created_merge_attributes.split(",").length : 0;
    let most_relations_merge_attributes_count = template.most_relations_merge_attributes ? template.most_relations_merge_attributes.split(",").length : 0;
    let most_related_items_merge_attributes_count = template.most_related_items_merge_attributes ? template.most_related_items_merge_attributes.split(",").length : 0;
    let totalAttributesUnassigned = api.state.totalAttributes - newest_updated_merge_attributes_count - oldest_created_merge_attributes_count - most_relations_merge_attributes_count - most_related_items_merge_attributes_count;  
    api.setState('totalAttributesUnassigned',totalAttributesUnassigned);

    api.setState('template', template);
    api.setState('isDirty', true);

}
