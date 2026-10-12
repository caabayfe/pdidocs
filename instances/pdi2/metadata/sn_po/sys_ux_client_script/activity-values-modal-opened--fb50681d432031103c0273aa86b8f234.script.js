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
    let activityForm = { ...api.state.activityForm
    };
    if (api.state.selectedActivityFieldDetails.internalType === 'boolean') {
        let value = false;
        if (activityForm.fields.activityValues.selectedValues.length > 0 && activityForm.fields.activityValues.selectedValues[0]) {
            value = true;
        }
        api.setState('fieldSelectValuesToggleValue', value);
        api.setState('selectedActivityValues', []);
    } else {
        const activityValues = [...activityForm.fields.activityValues.selectedValues];
        const selectedActivityValues = [];
        for (let value in activityValues) {
            // Convert [empty] activity def value 'null' which is how
            // it is denoted in choice values response
            const adValue = activityValues[value].id !== '[empty]'
                ? activityValues[value]
                : { id: 'null', label: activityValues[value].label };
            selectedActivityValues.push(adValue);
        }
        let includeActivityValues = activityForm.fields.activityValuesChoice == "ALL" || activityForm.fields.activityValuesChoice == null ? "Include" : activityForm.fields.activityValuesChoice == "INCLUDE" ? "Include" : "Exclude";
        api.setState('includeActivityValues', includeActivityValues);
        api.setState('selectedActivityValues', selectedActivityValues);       
    }
}
