/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var itemsChanged = api.state.itemsChanged;
    var selectedItems = api.state.selectedItem;
    if (typeof selectedItems === 'string') {
        if (selectedItems === "") {
            selectedItems = [];
        } else {
            try {
                selectedItems = JSON.parse(selectedItems);
            } catch (e) {
                console.error("Error parsing selected items: ", e);
                selectedItems = [];
            }
        }
    }
    selectedItems.forEach((arrayItem, index) => {
        itemsChanged.push(arrayItem);
    });
    api.setState('itemsChanged', itemsChanged);
    api.setState('selectedItem', []);
}
