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
    const gFormData = api.data.gform && api.data.gform.nowRecordFormBlob;
    const {
        fieldElements,
        formFieldValues,
    } = gFormData;

    const {
        colorFields
    } = api.state;

    const webClientBranding = api.state.webClientBrandingSettings;

    var colorFieldValues = [];
    fieldElements.forEach(function(fieldElement) {
        const val = formFieldValues[fieldElement.name];
        const stateVal = colorFields.find(function(value) {
            return (fieldElement.name == value.key);
        });

        if (fieldElement.dictionary.type == 'color') {
            let _value = val ? (val.value || '#FFFFFF').toUpperCase() : '#FFFFFF';
            colorFieldValues.push({
                "key": fieldElement.name,
                "displayValue": fieldElement.dictionary.label,
                "value": (stateVal) ? stateVal.value : _value
            });
        }
        if (fieldElement.name == 'va_logo') {
            webClientBranding[fieldElement.name] = val.displayValue;
        } else {
            webClientBranding[fieldElement.name] = val.value;
        }
    });
    api.setState('colorFields', colorFieldValues);
    api.setState('webClientBrandingSettings', { ...webClientBranding });
    // Resetting after a delay to render the header logo on page load
    let setOnce;
    helpers.timing.clearTimeout(setOnce);
    setOnce = helpers.timing.setTimeout(() => {
        api.setState('webClientBrandingSettings', { ...webClientBranding });
    }, 500);


}
