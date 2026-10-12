/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    return api?.data?.policy_details_form?.form?.fields?.status?.value === "inactive" ?  "Activate" : "Deactivate";
}
