function test(api) {
    const {
        macroponent
    } = api.input;
	if (!macroponent) return; 
    const {
        data,
        composition
    } = macroponent;
    if (!data?.length || !composition?.length) return;
    const controllers = data.filter(ctlr =>
        ctlr.definition?.id === '029f04e053610110ac9bddeeff7b1294'
    );

    if (!controllers.length) {
        return;
    }

    const controllerAddresses = new Set(controllers.map(ctrl => ctrl.elementId));
    const inputValueNames = Object.keys(controllers[0].inputValues).map(name => (name.startsWith('input') ? name.slice(5) : name).toLowerCase()).filter(name => name);

    if (inputValueNames.length === 0) {
        return;
    }

    const notification_text = api?.rule?.notification_text;
    for (const {
            propertyValues = {}, elementId, elementLabel
        }
        of composition) {

        for (const [propertyName, value] of Object.entries(propertyValues)) {
            if (isMatchingBinding(value)) {
                api.fail({
                    element: {
                        elementId,
                        elementLabel,
                    },
                    notification_text: notification_text,
                    notification_target: [{
                        type: 'property',
                        property: propertyName
                    }, ],
                });
            }
        }
    }

    function isMatchingBinding(value) {
        if (value?.type !== 'DATA_OUTPUT_BINDING') return false;

        const address = value?.binding?.address;
        if (!address || !controllerAddresses.has(address[0]) || address[1] === 'inputs') return false;

        const lastAddressItem = address[address.length - 1]?.toLowerCase();
        return inputValueNames.some(name =>
            lastAddressItem?.includes(name));
    }
}
