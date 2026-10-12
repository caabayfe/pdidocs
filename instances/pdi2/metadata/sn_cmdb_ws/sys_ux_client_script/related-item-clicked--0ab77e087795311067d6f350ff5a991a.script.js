/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {

    let index = api.state.mergeRelatedItems.findIndex(obj => obj.id===event.payload.item.id);
    if(index !== -1) {
        api.setState('selectedRelatedItemCondition',api.state.mergeRelatedItems[index].condition);
        api.setState('selectedRelatedItem',[[api.state.mergeRelatedItems[index].id]]);
        api.setState('tempSelectedRelatedItemCondition', api.state.mergeRelatedItems[index].condition);
    };
}
