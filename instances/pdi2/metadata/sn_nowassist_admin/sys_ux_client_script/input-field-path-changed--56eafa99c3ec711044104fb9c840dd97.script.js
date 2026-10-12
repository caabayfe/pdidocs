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
    let selectedTableFields = api.state.selectedTableFields || [];

    const fieldPath = event.payload.combinedPath;
    const indexOfFieldPath = selectedTableFields.findIndex(tableField => tableField.id === fieldPath);
    if (indexOfFieldPath === -1) {
        selectedTableFields.push({
            id: fieldPath,
            label: event.payload.combinedPathDisplay
        });
        api.setState('selectedTableFields', JSON.parse(JSON.stringify(selectedTableFields)));

        api.emit('OVERRIDE_SET_CONFIGURATION_CHANGED', {
            variableName: 'input_fields',
            variableValue: selectedTableFields.map(field => field.id).join(',')
        });
    }
}
