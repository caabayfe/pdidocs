/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return api.data.glide_form_1.nowRecordFormBlob.sysId != null && api.data.glide_form_1.nowRecordFormBlob.canCreate;
}
