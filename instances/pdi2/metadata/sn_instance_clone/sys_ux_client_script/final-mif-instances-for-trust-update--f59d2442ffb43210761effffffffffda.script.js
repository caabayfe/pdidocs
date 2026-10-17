/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({ api, event }) {
    const multiInstanceView = { ...api.state.multiInstanceView };
    const step2Checklist = [...multiInstanceView.mif_instances]; // already an array
    const { itemId, checked } = event.payload;

    // Update the checked status
    step2Checklist.forEach(item => {
        if (item.itemId === itemId) {
            item.checked = checked;
        }
    });

    // Update mif_instances
    multiInstanceView.mif_instances = step2Checklist;

    // Ensure trustorInstances exists
    multiInstanceView.trustorInstances = multiInstanceView.trustorInstances || [];

    // Remove any existing entry for this item
    multiInstanceView.trustorInstances = multiInstanceView.trustorInstances.filter(i => i.itemId !== itemId);

    // Find the corresponding item for label
    const matchedItem = step2Checklist.find(i => i.itemId === itemId);

    // Add it back if checked
    if (checked && matchedItem) {
        multiInstanceView.trustorInstances.push({
            itemId,
            label: matchedItem.label, // ✅ Use label from the original item
            readonly: true,
            checked: true
        });
    }

    // Save updated state
    api.setState('multiInstanceView', multiInstanceView);
}
