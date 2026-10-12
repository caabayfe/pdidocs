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
    if (!event.payload || !event.payload.countryCodeSelected) return;
    const selectCountryCodeState = { ...api.state.selectCountryCodeState
    };
    selectCountryCodeState.selectedItem = event.payload.countryCodeSelected;
    api.setState("selectCountryCodeState", selectCountryCodeState);
}
