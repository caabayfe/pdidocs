/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const line1 = helpers.translateSync("Number of days after which a task is considered stale and is set to Closed Cancelled by a daily scheduled job.");
    const line2 = helpers.translateSync("A task becomes stale if:");
    const line3 = helpers.translateSync("The task was created at least {0} days ago and it is still open.", api.data.staleTaskPropValue);
    const line4 = helpers.translateSync("The approval requests are older than {0} days and the task is not yet approved.", api.data.staleTaskPropValue);
    return `<p style='margin-top: 0px; font-size:1rem'>${line1}<br/>${line2}<br/><ul style='margin: 0px; font-size:1rem;'><li>${line3}</li><li>${line4}</li></ul><p>`;
}
