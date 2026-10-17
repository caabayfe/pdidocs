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
    function updateWebclientSettings(updatedVal) {
        const {
            webClientBrandingSettings
        } = api.state;
        api.setState('webClientBrandingSettings', {
            ...webClientBrandingSettings,
            ...updatedVal
        });
    }

    function updateGFormAndProps(colorKey, colorVal) {
        try {
            if (!colorKey || !colorVal) return;
            const {
                colorFields,
                webClientBrandingSettings
            } = api.state;
            const updatedColor = {};
            updatedColor[colorKey] = {
                'name': colorKey,
                'value': colorVal,
                'displayValue': colorVal
            };

            //update colormap
            api.setState('colorFields', {
                ...colorFields,
                ...updatedColor
            });
            api.setState('colorPickerColor', colorVal);
            //update gform
            api.data.gform.nowRecordFormBlob.gForm.setValue(colorKey, colorVal);


            //update webclient
            updatedColor[colorKey] = colorVal;
            updateWebclientSettings(updatedColor);
        } catch (e) {
            api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
                items: [{
                    id: 'delete-fail',
                    status: 'error',
                    icon: 'exclamation-triangle-outline',
                    content: 'Changes are not updated.',
                    action: {
                        type: 'dismiss'
                    }
                }]
            });
        }
    }
    try {
        switch (event.name) {
            //when color selected from color picker
            case 'NOW_COLOR_PICKER#SELECTED_COLOR_SET':
                const lastColor = api.state.lastColor;
                const thisColor = event.payload.value;
                const colKey = api.state.selectedColorKey;
                const currentColor = api.state.colorFields[colKey].value || null;
                if (thisColor === lastColor || (currentColor && currentColor.toLowerCase() === thisColor.toLowerCase())) return;
                api.setState('lastColor', thisColor);
                if (event.payload.value) {
                    updateGFormAndProps(colKey, thisColor);
                }
                break;
                //either the color fill button clicked 
                //or, input field value changed
            case 'COLOR_SELECT_ROW_ACTION_PERFORMED':
                const colorActionData = event.payload;
                if (colorActionData.new_value && colorActionData.key) {
                    updateGFormAndProps(colorActionData.key, colorActionData.new_value);
                    return;
                }
                api.setState('colorPickerColor', api.state.colorFields[colorActionData.key].value);
                if (colorActionData.open_color_picker) api.setState('hideColorPicker', false);
                if (colorActionData.key) api.setState('selectedColorKey', colorActionData.key);

                break;

        }
    } catch (e) {
        return;
    }
}
