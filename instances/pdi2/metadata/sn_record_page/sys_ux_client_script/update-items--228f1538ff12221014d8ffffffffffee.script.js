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
    const isItemSelected = event.payload.selected;
    const availableItems = api.state.availableItems === null ? {} : api.state.availableItems.glideListData;
    const targetId = event.payload.item[0].id;
    const targetLabel = event.payload.item[0].label;
    const selectedItems = api.state.selectedItems === null || api.state.selectedItems === undefined ? [] : api.state.selectedItems;
    let finalSelectedItems = [];
    if (!isItemSelected) {
        const unselectedItem = {
            [targetId]: {
                label: targetLabel,
                reference: null
            }
        };
        if (!targetLabel.includes("@")) {
            const unsortedGlideList = Object.assign({}, unselectedItem, availableItems);

            const sortedGlideList = Object.entries(unsortedGlideList).sort(([, a], [, b]) =>
                a.label.localeCompare(b.label));
            const finalGlideListData = Object.fromEntries(sortedGlideList);

            api.setState("availableItems", {
                glideListData: Object.assign({}, finalGlideListData)
            });
        }
        
       for (const item of selectedItems.flat()) {
        if (item.id !== targetId && item.label !== targetLabel) {
        finalSelectedItems.push([item]);
    }
    }
    } else {
        finalSelectedItems = [...selectedItems, [{
            id: targetId,
            label: targetLabel
        }]];
    }
    api.setState("selectedItems", finalSelectedItems);

}
