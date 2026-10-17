function test(api) {
    const elementIds = new Set();
    const mcp = api.input.macroponent;
    const composition = mcp.composition;
    for (const el of composition) {
        if (elementIds.has(el.elementId)) {
            api.fail({
                notification_text: `The component with ID ${el.elementId} appears more than once in the page definition. Each component must have a unique ID to avoid rendering issues and runtime conflicts.`,
                notification_target: [{
                    type: 'property',
                    property: 'pageDefinition'
                }]
            });
        }
        if (!el.elementId && el.elementId.length === 0) {
            api.fail({
                notification_text: "Element ID must be unique and cannot be empty because only one element with the same ID will render at runtime",
                notification_target: [{
                    type: 'property',
                    property: 'pageDefinition'
                }]
            });
        }
        elementIds.add(el.elementId);
    }
}
