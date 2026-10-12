/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({ api, event, helpers, imports }) {
    const {
        id,
        value
    } = event.payload;

    if (id === 'aging_timeframe_input') {
        if (value == '' || value <= 0 || value > 100 || value.indexOf(".") > -1) {
            api.setState("isSettingsPageDirty", false);
        } else {
            api.setState("isSettingsPageDirty", true);
        }
    } else if (event.name === 'NOW_CHECKBOX#CHECKED_SET') {
        api.setState("isSettingsPageDirty", true);
    } else if (event.name === 'NOW_TYPEAHEAD#SELECTED_ITEM_SET') {
        let selectedUserValueIsEmpty = api.state.runAsUserDefaultPropValue == '';
        if(value == '' || selectedUserValueIsEmpty) {
            api.setState("isSettingsPageDirty", false);
        } else {
            api.setState("isSettingsPageDirty", true);
        }
    } else {
        if (value == '' || value <= 0) {
            api.setState("isSettingsPageDirty", false);
        } else {
            api.setState("isSettingsPageDirty", true);
        }
    }
}
