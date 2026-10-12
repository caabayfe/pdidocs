/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
    var bp_status = api.data.bp_details_form.form.fields.status.value;
    if (bp_status != 'completed') {
        return true;
    }
    return false;
}
