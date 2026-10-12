/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if (api?.data?.glide_form_1?.nowRecordFormBlob?.fields?.compliance_status?.highlightedValue) {
    var removedHighlight = api.data.glide_form_1.nowRecordFormBlob.fields;
    removedHighlight.compliance_status.highlightedValue = '';
    return removedHighlight;
  }
  return api?.data?.glide_form_1?.nowRecordFormBlob?.fields;
}
