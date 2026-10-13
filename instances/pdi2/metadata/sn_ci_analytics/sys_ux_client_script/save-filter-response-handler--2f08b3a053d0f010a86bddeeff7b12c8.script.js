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
        errorMessage,
        conditionSysId
    } = event.payload.data.output;
    api.setState('isFilterSaving', false);
    if (errorMessage) {
        api.setState('filterSaveErrorMessage', errorMessage);
    } else if (conditionSysId) {
        const {
            filterNameInput
        } = api.state;
        api.setState('selectedFilterId', conditionSysId);
        api.data.get_filters_list_in_modal.refresh();
        helpers.modal.close("[component-id$='save_filter_modal']");
    }
}
