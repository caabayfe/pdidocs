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
    api.setState('isLoading',false);
    const activities = api.data.look_up_activities.results;
    const listItems = [];
    for (const activity of activities) {
        listItems.push({
            id: activity.field.value,
            label: activity.field.displayValue,
        });
    }
    const automatedFindingForm = { ...api.state.automatedFindingForm
    };
    automatedFindingForm.fields.listItems = listItems;
    api.setState('automatedFindingForm', automatedFindingForm);
 
}
