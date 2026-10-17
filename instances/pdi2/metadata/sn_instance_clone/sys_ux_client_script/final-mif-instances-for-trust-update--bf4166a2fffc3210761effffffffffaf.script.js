/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function handler({ api, event }) {
    debugger;
    const multiInstanceView = { ...api.state.multiInstanceView };
    const step2Checklist = [...multiInstanceView.mif_instances];
    const { itemId, checked } = event.payload;

    // Previous checked state (from current mif_instances)
    const prevItem = step2Checklist.find(item => item.itemId === itemId);
    const prevChecked = prevItem ? prevItem.checked : false;

    // Update current checklist
    step2Checklist.forEach(item => {
        if (item.itemId === itemId) {
            item.checked = checked;
        }
    });
    multiInstanceView.mif_instances = step2Checklist;

    // Initialize trustorInstances
    multiInstanceView.trustorInstances = multiInstanceView.trustorInstances || [];

    // Get original checked state for this item
    const originalItem = 
  multiInstanceView.originalInstances && 
  multiInstanceView.originalInstances.find(i => i.itemId === itemId);
    const originalChecked = originalItem ? originalItem.checked : false;

    // Remove any existing delta record for this item first
    multiInstanceView.trustorInstances = multiInstanceView.trustorInstances.filter(i => i.itemId !== itemId);

    // Only add to trustorInstances if current checked != original checked
    if (checked !== originalChecked) {
        const matchedItem = step2Checklist.find(i => i.itemId === itemId);
        if (matchedItem) {
            const suffix = checked ? '    (Adding)' : '    (Removing)';
            multiInstanceView.trustorInstances.push({
                itemId: matchedItem.itemId,
                label: matchedItem.name + suffix,
                readonly: true,
                name: matchedItem.name || matchedItem.label,
                checked: checked
            });
        }
    }

    api.setState('multiInstanceView', multiInstanceView);
}
