/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    
    const repeatType = api.state.repeatType;
    const suffix = api.state.repeatCountValue === 1 ? "" : "s";

    if (repeatType === 'daily') return 'day' + suffix;
    if (repeatType === 'weekly') return 'week' + suffix;
    if (repeatType === 'monthly') return 'month' + suffix;
    if (repeatType === 'yearly') return 'year' + suffix;

    if (repeatType === 'specific') return 'specific';
}
