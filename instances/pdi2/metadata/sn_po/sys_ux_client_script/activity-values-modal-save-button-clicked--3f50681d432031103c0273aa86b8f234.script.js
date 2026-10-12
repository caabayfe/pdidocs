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
    let activityForm = { ...api.state.activityForm
    };
    if (api.state.selectedActivityFieldDetails.internalType === 'boolean') {
        activityForm.fields.activityValues.selectedValues = [Number(api.state.fieldSelectValuesToggleValue)];
        activityForm.fields.activityValues.selectedValuesLabels = [api.state.fieldSelectValuesToggleValue];
        activityForm.fields.activityValuesChoice = 'INCLUDE';
    } else {
        activityForm.fields.activityValues.selectedValues = api.state.selectedActivityValues;
        activityForm.fields.activityValues.selectedValuesLabels = api.state.selectedActivityValues.map(v => v.label);
        activityForm.fields.activityValuesChoice = activityForm.fields.activityValues.selectedValues.length == 0 ? "ALL" : (api.state.includeActivityValues == "Include" ? "INCLUDE" : "EXCLUDE");
    } 
    api.setState('activityForm', activityForm);
}
