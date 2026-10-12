/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return api.data.g_form.hasNoVariables || api.context.props.hideOptionsLabel + '' == 'true';
}
