function test(api) {
    const composition = api.input.macroponent.composition;
    const rulesElement = api.ruleElement;
    const elementId = rulesElement.elementId;
    const modalHeaderLabel = rulesElement?.propertyValues?.headerLabel?.value?.message;

    if (modalHeaderLabel == null || modalHeaderLabel.length == 0) {
        let buttonLinked = false;
        const regex = /{[^{}]*"modalId"[^{}]*}/g; //One level above occurrence of modalId to access headerLabel
        const match = JSON.stringify(composition).match(regex);

        //Iterating through eventMappings of buttons
        if (match != null) {
            for (let i = 0; i < match.length; i++) {
                if (match[i].includes(`${elementId}`)) {
                    const headerLabelValue = match[i].match(/"headerLabel"\s*:\s*(null|"(.*?)")/);
                    if (headerLabelValue[1] === "null" || headerLabelValue[2].length == 0) {
                        api.fail({notification_target: [{type: "property", property:'headerLabel'}]}); //If the button event handler does not set the modal header
                    }
                    buttonLinked = true;
                }
            }
        }
        if (!buttonLinked) {
            api.fail({notification_target: [{type: "property", property:'headerLabel'}]}); //If there aren't any buttons that set the modal header
        }
    }
}
