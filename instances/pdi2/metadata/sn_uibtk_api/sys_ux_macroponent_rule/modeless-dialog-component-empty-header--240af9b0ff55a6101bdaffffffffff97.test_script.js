function test(api) {
    const composition = api.input.macroponent.composition;
    const rulesElement = api.ruleElement;
    const elementId = rulesElement.elementId;
    if (rulesElement.propertyValues == null || rulesElement.propertyValues?.headingLabel?.value?.length > 0) {
        return;
    }

    /**Get the entire object in eventMappings.targets.operation.payload.container if matches elementId */
    function getMatchingContainers(data, targetCompositionId) {
        const result = [];

        data.forEach(component => {
            if (!Array.isArray(component.eventMappings)) return;

            component.eventMappings.forEach(mapping => {
                if (!Array.isArray(mapping.targets)) return;

                mapping.targets.forEach(target => {
                    const container = target?.operation?.payload?.container;
                    const compIdValue = container?.compositionId?.value;

                    if (compIdValue === targetCompositionId) {
                        result.push(container);
                    }
                });
            });
        });

        return result;
    }

    const containers = getMatchingContainers(composition, elementId);
    const setHeadingByEvent = (element) => (element?.dialogTitle?.value?.message?.length > 0 || element?.minimizedTitle?.value?.message?.length > 0);
    if (containers.some(setHeadingByEvent)) {
        return;
    }

    api.fail({
        notification_target: [{
            type: "property",
            property: 'headingLabel'
        }]
    });




}
