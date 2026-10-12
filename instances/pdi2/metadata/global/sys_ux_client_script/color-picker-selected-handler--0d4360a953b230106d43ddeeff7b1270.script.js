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
    const {
        colorFields,
        selectedColor,
        webClientBrandingSettings
    } = api.state;
    const colorKey = event.payload.key || selectedColor.key;
    const colorVal = event.payload.value;
    if (event.payload.key && event.payload.key != selectedColor.key) {
        api.setState('hideColorPicker', true);
    }
    selectedColor['color'] = colorVal;
    var colorFieldEle = colorFields.find(function(colorField) {
        return (colorField.key == colorKey);
    });
    colorFieldEle.value = colorVal;
    if (webClientBrandingSettings && webClientBrandingSettings[colorKey]) {
        let updatedColor = {};
        updatedColor[colorKey] = colorVal;
        api.setState('webClientBrandingSettings', {
            ...webClientBrandingSettings,
            ...updatedColor
        });
    }
    try {
        api.setState('colorFields', JSON.parse(JSON.stringify(colorFields)));
        api.setState('selectedColor', JSON.parse(JSON.stringify(selectedColor)));
        api.emit("RECORD#GFORM_SET_VALUE", {
            "fieldName": colorKey,
            "value": colorVal,
            "displayValue": colorVal
        });
    } catch (e) {

    }
}
