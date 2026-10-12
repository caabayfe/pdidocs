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
        case 'add_related_item_condition':
            let mergeRelatedItems = JSON.parse(JSON.stringify(api.state.mergeRelatedItems));
            let selectedItems = api.state.newMergeRelatedItem.items.split(',');
            selectedItems.forEach(item => {
                mergeRelatedItems.push({
                    "id": item,
                    "label": api.state.allRelatedItems[item],
                    "condition": api.state.newMergeRelatedItem.condition
                });
            });
            // select the last related item added
            api.setState('selectedRelatedItem', [
                [mergeRelatedItems[mergeRelatedItems.length - 1].id]
            ]);
            api.setState('selectedRelatedItemCondition', mergeRelatedItems[mergeRelatedItems.length - 1].condition);
            api.setState('mergeRelatedItems', mergeRelatedItems);
            break;

        case 'delete_condition':
            let allMergeRelatedItems = JSON.parse(JSON.stringify(api.state.mergeRelatedItems));
            let index = allMergeRelatedItems.findIndex(obj => obj.id === api.state.selectedRelatedItem[0][0]);

            if(index != -1 ) {
                allMergeRelatedItems.splice(index,1);
                api.setState('mergeRelatedItems', allMergeRelatedItems);
                if(allMergeRelatedItems.length != 0) {
                    api.setState('selectedRelatedItem', [
                        [allMergeRelatedItems[0].id]
                    ]);
                    api.setState('selectedRelatedItemCondition', allMergeRelatedItems[0].condition);
                }       
            }
            break;
        case 'copy_condition':
            api.setState("newMergeRelatedItem",{
                "condition": api.state.selectedRelatedItemCondition,
                "items": [],
                "selected": []
            });
            api.setState('tempRelatedItemCondition',api.state.selectedRelatedItemCondition); // This is a work around for the flashing isue with the condition builder
            break;
        case 'open_reference_modal':
            if(api.state.referenceTableName != event.context.item.value.attribute.reference)
                api.setState('referenceTableName',event.context.item.value.attribute.reference);
            api.setState('referenceIndex',event.context.item.index)
            break;
    }

    api.setState('template', template);
    api.setState('isDirty', true);
}
