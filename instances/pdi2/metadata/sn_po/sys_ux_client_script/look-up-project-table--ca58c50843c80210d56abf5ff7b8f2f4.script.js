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
    if (api.data.look_up_project_table.results?.length == 0) {
        return;
    }
    const { value, displayValue } = api.data.look_up_project_table.results[0].table;
    const automatedFindingForm = { ...api.state.automatedFindingForm
    };
    const entityId = api.data.look_up_project_table.results[0]._row_data.uniqueValue;
    automatedFindingForm.table.selectedValue = value;
    automatedFindingForm.table.displayValue = displayValue;
    automatedFindingForm.table.entityId = entityId;
    automatedFindingForm.table.readOnly = true;
    api.setState('automatedFindingForm', automatedFindingForm);

    api.setState('entityId',entityId);
    api.data.look_up_activities.refresh();
}
