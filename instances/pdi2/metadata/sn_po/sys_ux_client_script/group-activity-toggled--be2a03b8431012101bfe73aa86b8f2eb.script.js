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
    let activityForm = { ...api.state.activityForm };

    if (event.payload.value) {
        activityForm.fields.groupValues.value = 'group-unique-values';
        if (activityForm.fields.relation?.label) {
            activityForm.fields.groupedActivityName.value = `${activityForm.fields.relation.label} changed`
        }
    } else {
        activityForm.fields.groupValues.value = 'separate-unique-values';
    }
    const selectedRecommendedActivity = {...api.state.selectedRecommendedActivity, grouped: false};
    api.setState('selectedRecommendedActivity', selectedRecommendedActivity);

    activityForm.fields.hideActivity.value = false;
    api.setState('activityForm', activityForm);
}
