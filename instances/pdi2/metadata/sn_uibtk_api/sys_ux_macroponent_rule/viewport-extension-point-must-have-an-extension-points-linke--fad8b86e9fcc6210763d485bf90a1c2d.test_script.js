function test(api) {
    const ruleElement = api.ruleElement;
    if (ruleElement.definition.id === 'MACROPONENT_VIEWPORT_HEADLESS') {
        const extPts = ruleElement.extensionPoints;
        const pageCollectionMode = ruleElement.propertyValues.pageCollectionMode;
        if (pageCollectionMode && pageCollectionMode.value && extPts && extPts.length === 0) {
            api.fail({
                notification_text: 'Ensure that the page collection is properly connected to a controller to ensure that the page renders as expected.',
                notification_target: [{
                    type: 'property',
                    property: 'pageDefinition'
                }]
            });
        }
        if (extPts && extPts.length > 0 && pageCollectionMode && pageCollectionMode.value === false) {
            api.fail({
                notification_text: 'Check the JSON in the Composition and set "pageCollectionMode" to true to ensure that the page renders as expected.',
                notification_target: [{
                    type: 'property',
                    property: 'pageDefinition'
                }]
            });
        }
    }
}
