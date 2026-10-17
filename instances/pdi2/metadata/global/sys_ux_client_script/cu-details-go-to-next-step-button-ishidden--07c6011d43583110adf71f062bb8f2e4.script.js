/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    return api?.data?.critical_update_steps_completed?.output?.totalSteps === api?.data?.critical_update_steps_completed?.output?.completedSteps;
}
