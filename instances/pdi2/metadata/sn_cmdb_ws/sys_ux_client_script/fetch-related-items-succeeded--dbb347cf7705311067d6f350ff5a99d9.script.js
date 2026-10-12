/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {

    let available = event.payload.data.output.result.available;
    let whitelist = event.payload.data.output.result.whitelist;
    let allRelatedItems = {...available,...whitelist};
    
    // Remove '->' from name
    Object.keys(allRelatedItems).forEach((i) => {
        let x = allRelatedItems[i].indexOf("->");
        if(x != -1)
            allRelatedItems[i] = allRelatedItems[i].substring(0, x-1);
    });
    api.setState("allRelatedItems", allRelatedItems);

    let mergeRelatedItems = api.state.mergeRelatedItems;
    mergeRelatedItems.forEach((item) => {
        item.label = allRelatedItems[item.id] ? allRelatedItems[item.id] : "";
    });
    api.setState('mergeRelatedItems',mergeRelatedItems);

    if (mergeRelatedItems.length != 0) {
        api.setState('selectedRelatedItem',[[mergeRelatedItems[0].id]]);
        api.setState('selectedRelatedItemCondition',mergeRelatedItems[0].condition);
    }

}
