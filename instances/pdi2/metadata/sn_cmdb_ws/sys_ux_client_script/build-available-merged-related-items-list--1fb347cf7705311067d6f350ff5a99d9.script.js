/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {

    let availableRelatedItems = {"items" :{}};
    const keys = Object.keys(api.state.allRelatedItems);
    keys.forEach((key, index) => {
        // check to see if this item is already used.
        if(!api.state.mergeRelatedItems.find(x => x.id === key)){
            // need to use index for the key. the value contains characters that causes the select componet to fail
            let newKey = key.replace('.','&#46;');
            availableRelatedItems.items[newKey] = {"label" : api.state.allRelatedItems[key],"key": key};
        }
    });
    let selectedRelatedItems = [];
    // sort objects keys alphabetically.
    Object.entries(availableRelatedItems.items).sort().reduce( (o,[k,v]) => (o[k]=v,o), {} );
    api.setState("newSelectedRelatedItems",selectedRelatedItems); // this resets the selected items.
    api.setState("availableRelatedItems",availableRelatedItems);
    api.setState("newMergeRelatedItem",{
        "condition": "",
        "items": [],
        "selected": []
    });
    api.setState("tempRelatedItemCondition","");
}
