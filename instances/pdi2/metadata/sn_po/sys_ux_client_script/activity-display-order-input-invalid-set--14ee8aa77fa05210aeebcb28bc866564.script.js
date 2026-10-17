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
    const { value } = api.state.activityForm.fields.displayOrder;
    let activityForm = { ...api.state.activityForm };
    let invalid = false;
    if (!value || !(/^-?\d+$/.test(value))) {
        invalid = true;
    }
    if (value > 1000 || value < -1000) {
        invalid = true;
    }
    if (activityForm.fields.displayOrder.invalid !== invalid) {
        activityForm.fields.displayOrder.invalid = invalid;
        api.setState('activityForm', activityForm);
    }
    return invalid;
}
