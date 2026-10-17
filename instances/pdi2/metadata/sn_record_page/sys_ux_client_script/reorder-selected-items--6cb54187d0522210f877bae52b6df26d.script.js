/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({
    api,
    event,
    helpers,
    imports
}) {
    const updatedItems = event.payload;
    const {
        selectedItems
    } = api.state;
    const reorderedItems = updatedItems.map(([ref]) => {
        const target = selectedItems.find(([item]) => item.label === ref.label);
        if (target[0].label.includes("@")) {
            return [{
                id: target[0].label,
                label: target[0].label
            }];
        } else {
            return target;
        }
    });
    api.setState("selectedItems", reorderedItems);

}
