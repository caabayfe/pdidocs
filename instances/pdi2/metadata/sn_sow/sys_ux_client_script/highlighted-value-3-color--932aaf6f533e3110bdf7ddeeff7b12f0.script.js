/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const status = { ...api.item.value.status };
	return status.value == 'complete' ? 'green' : 'warning';
}
