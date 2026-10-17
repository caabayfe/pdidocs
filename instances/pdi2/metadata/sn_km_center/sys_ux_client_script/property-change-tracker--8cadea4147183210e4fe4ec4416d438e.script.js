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
    // Initialize state if not already done
    if (api.state.changedProperties === undefined) {
        api.setState('changedProperties', {});
    }

    // Handle data load event to store original values
    if (event.elementId === 'fetch_knowledge_management_properties' && event.name === 'DATA_FETCH_SUCCEEDED') {
        const categories = api.data.fetch_knowledge_management_properties.output.categories || [];
        const originalValues = {};

        // Process all properties from all categories
        categories.forEach(category => {
            (category.properties || []).forEach(property => {
                originalValues[property.sysId] = property.value;
            });
        });

        // Store original values in state
        api.setState('originalPropertyValues', originalValues);
        api.setState('changedProperties', {});
        api.setState('isSaveEnabled', false);
    }

    // Handle input value set events
    if (event.name === 'NOW_INPUT#INPUT') {
        const propertyId = event.context.item.value.sysId;
        const newValue = event.payload.fieldValue;

        if (propertyId && newValue !== undefined) {
            updateChangedProperty(propertyId, newValue);
        }
    }

    // Handle toggle clicked events
    if (event.name === 'NOW_TOGGLE#CHECKED_SET') {
        const propertyId = event.context.item.value.sysId;
        let newValue = event.payload.value;

        // Ensure boolean type for toggle value
        if (typeof newValue === 'string') {
            newValue = newValue === 'true';
        }

        if (propertyId && newValue !== undefined) {
            updateChangedProperty(propertyId, newValue);
        }
    }

    // Handle select/dropdown change events
    if (event.name === 'NOW_SELECT#SELECTED_ITEM_SET') {
        const propertyId = event.context.item.value.sysId;
        const dropdownSelectedlabel = event.payload.item.label;
        const dropdownSelectedValue = event.payload.value;
        if (propertyId && dropdownSelectedlabel !== undefined) {
            updateChangedProperty(propertyId, dropdownSelectedValue);
        }
    }

    /**
     * Update a property in the changedProperties state
     */
    function updateChangedProperty(propertyId, newValue) {
        // Get original value
        const originalValues = api.state.originalPropertyValues || {};
        const originalValue = originalValues[propertyId];

        // Get current changed properties
        const changedProperties = { ...api.state.changedProperties
        };

        // Compare with original value
        let isChanged = false;

        // Handle different types for comparison
        if (typeof newValue === 'string' && typeof originalValue === 'string') {
            isChanged = newValue !== originalValue;
        } else if (typeof newValue === 'boolean' && typeof originalValue === 'boolean') {
            isChanged = newValue !== originalValue;
        } else if (typeof newValue === 'number' && typeof originalValue === 'number') {
            isChanged = newValue !== originalValue;
        } else {
            // Convert to strings for comparison if types don't match
            isChanged = String(newValue) !== String(originalValue);
        }
        // Update changedProperties based on comparison
        if (isChanged) {
            // Property has changed - add to changedProperties
            changedProperties[propertyId] = {
                sysId: propertyId,
                value: newValue,
            };
        } else {
            // Property matches original value - remove from changedProperties
            delete changedProperties[propertyId];
        }

        // Update state
        api.setState('changedProperties', changedProperties);

        // Enable/disable save button based on whether any properties have changed
        const hasChanges = Object.keys(changedProperties).length > 0;
        api.setState('isSaveEnabled', hasChanges);
    }
}
