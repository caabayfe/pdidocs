/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	const fields = api.state.fields;
	return !(fields && Object.keys(fields).length != 0);
}
