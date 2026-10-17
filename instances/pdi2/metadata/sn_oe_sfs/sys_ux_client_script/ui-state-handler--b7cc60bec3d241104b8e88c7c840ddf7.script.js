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
    function resetStates(){
        api.setState('openIconPopup', false);
        api.setState('selectedIcon', null);
        api.setState('hideColorPicker', true);
        api.setState('selectedColorKey', null);
        api.setState('colorPickerColor', null);
        api.setState('webclientDisplayState', 'input');
        api.setState('highlightIcon', null);
        api.setState('openFontUploadPopup', false);
        const webclientIconsProp = api.data.ci_branding_settings_helper.output.webclient_icons_prop;
        if(webclientIconsProp) api.setState('webclientIconsProp', { ...webclientIconsProp });
    }

    try {
        if (event.name == 'DATA_FETCH_SUCCEEDED' && event.elementId == 'ci_branding_settings_helper') {
            api.setState('webclientIconsProp', api.data.ci_branding_settings_helper.output.webclient_icons_prop);
            return;
        }
        if (event.name == 'CI_MENU_ITEM_ACTION' && event.payload.payload && event.payload.payload.name == 'file_attached') {
            const {
                webclientIconsProp,
                selectedIcon
            } = api.state;
            const {
                display_state,
                highlight_icon
            } = selectedIcon;
            const {
                icon_image
            } = event.payload.payload;
            const updatedIcon = {};
            updatedIcon[highlight_icon] = icon_image;
            api.setState('webclientIconsProp', { ...webclientIconsProp,
                ...updatedIcon
            });
            api.setState('webclientDisplayState', display_state);
            api.setState('highlightIcon', highlight_icon);
            return;
        }
        resetStates();
    } catch (e) {
        resetStates();
    }
}
