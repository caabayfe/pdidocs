/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
     if (api?.item?.value?.currentProvider?.id) {
        return api?.item?.value?.currentProvider?.id || "";
    } 
     return api?.item?.value?.selectedProvider || "";
}
