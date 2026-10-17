/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {

    let template = JSON.parse(JSON.stringify(api.state.template));
    switch (event.elementId) {
        case 'class_condition_builder':
            if((template.conditions || "") != event.payload.value)
                api.setState('isDirty',true);
            template.conditions = event.payload.partial ? "partial" : event.payload.value;
            break;
        case 'main_ci_condition_builder':
            if((template.main_ci_condition || "") != event.payload.value)
                api.setState('isDirty',true);
            template.main_ci_condition = template.main_ci_condition = event.payload.partial ? "" : event.payload.value;      
            break;
        case 'merge_relationship_condition_builder':
            if((template.merge_relations_condition || "") != event.payload.value)
                api.setState('isDirty',true);
            template.merge_relations_condition = event.payload.partial ? "" : event.payload.value;
            break;
        case 'new_related_item_condition':
            let newMergeRelatedItem = JSON.parse(JSON.stringify(api.state.newMergeRelatedItem));
            newMergeRelatedItem.condition = event.payload.partial ? "" : event.payload.value;
            api.setState('newMergeRelatedItem',newMergeRelatedItem);
            break;
        case 'related_item_inline_condition_builder':
            let mergeRelatedItems = api.state.mergeRelatedItems;
            let index = mergeRelatedItems.findIndex(obj => obj.id === api.state.selectedRelatedItem[0][0]);
            if(index !== -1 && event.payload.value) {
                if(mergeRelatedItems[index].condition != event.payload.value)
                    api.setState('isDirty',true);
                mergeRelatedItems[index].condition = event.payload.partial ? "" : event.payload.value;
                api.setState('mergeRelatedItems',mergeRelatedItems);
            }
            break;
    }

    api.setState('template', template);

}
