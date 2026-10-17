/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    var selectedRows = event.payload.selectedRows;
    var resultRows = api.state.searchResult.rows;
    var filteredSelectedRows = {};
    for (var resultRow of resultRows) {
        if (selectedRows[resultRow.key])
            filteredSelectedRows[resultRow.key] = selectedRows[resultRow.key];
    }
    api.setState('selectedTasks', selectedRows);
    api.setState('filteredSelectedTasks', filteredSelectedRows);
    var n = Object.keys(filteredSelectedRows).length;
    if (n == 0) {
        if (api.state.genAiSourceRecordId != null && api.state.genAiSourceRecordId.trim().length > 0) {
            api.setState('multitaskOKButtonIsDisabled', false);
            api.setState('multitaskOKButtonLabel', await helpers.translate("Continue without more tasks"));
        } else {
            api.setState('multitaskOKButtonIsDisabled', true);
            api.setState('multitaskOKButtonLabel', await helpers.translate('Continue with selected tasks'));
        }
    } else {
        api.setState('multitaskOKButtonLabel', await helpers.translate('Continue with selected tasks'));
        if (n > 5) {
            api.setState('multitaskOKButtonIsDisabled', true);
        } else {
            api.setState('multitaskOKButtonIsDisabled', false);
        }
    }
}
