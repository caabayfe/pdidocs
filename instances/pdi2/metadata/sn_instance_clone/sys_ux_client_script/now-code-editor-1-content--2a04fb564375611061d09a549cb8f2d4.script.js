/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var gFormData = api.data.gform.nowRecordFormBlob.gForm;
    return gFormData.getValue('script');
}
