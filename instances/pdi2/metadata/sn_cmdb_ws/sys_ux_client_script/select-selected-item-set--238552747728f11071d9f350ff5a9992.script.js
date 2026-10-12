/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    
    let template = JSON.parse(JSON.stringify(api.state.template));
    let deleteActions = [...api.state.deleteActions];

    switch (event.elementId) {
        case 'class_select':
            template.table = event.payload.value;
            api.data.deduplication_get_class_attributes.execute({
                'class': template.table,
            });
            // initiate fetching merged attributes for this class
            api.data.deduplication_get_merged_attributes.execute({
                'class': template.table,
            });
            api.data.deduplication_template_get_related_items.execute({
                'class': template.table,
            });
            // reset values
            template.task_conditions = "";
            template.master_ci_condition = "";
            template.newest_updated_merge_attributes = "";
            template.oldest_created_merge_attributes = "";
            template.most_relations_merge_attributes = "";
            template.most_related_items_merge_attributes = "";
            api.setState('temp_task_conditions', {});
            api.setState('temp_conditions', "");
            api.setState('temp_main_ci_condition', {});
            break;
        case 'select_main_ci_select':
            api.setState('temp_master_ci_option',event.payload.value);
            break;
        case 'duplicate_update_attribute_select':
            break;
        case 'select_discovery_source':
            api.setState('master_ci_discovery_source', event.payload.value);
            break;
        case 'template_library_select':
            template.library = event.payload.value;
            break;
        case 'boolean_select':   
            deleteActions[event.context.item.index].value = event.payload.value;
            deleteActions[event.context.item.index].display = event.payload.value;
            break;
        case 'choice_list_select':
            deleteActions[event.context.item.index].value = event.payload.value;
            deleteActions[event.context.item.index].display = event.payload.item.label ? event.payload.item.label : event.payload.value;
            break;
    }

    api.setState('deleteActions',deleteActions);
    api.setState('template', template);
    api.setState('isDirty', true);
}
