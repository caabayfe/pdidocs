/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var removedValue = api?.data?.bp_details_form?.form?.fields?.removed?.value;
    return !removedValue;
}
