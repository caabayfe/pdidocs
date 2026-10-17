/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    
    let results = event.payload.data.output.result;
    let relatedItemLookup = {...event.payload.data.output.result.available,...event.payload.data.output.result.whitelist};
    // Remove '->' from name
    Object.keys(relatedItemLookup).forEach((i) => {
        let x = relatedItemLookup[i].indexOf("->");
        if(x != -1)
            relatedItemLookup[i] = relatedItemLookup[i].substring(0, x-1);
    });
    api.setState('relatedItemLookup', relatedItemLookup);
}
