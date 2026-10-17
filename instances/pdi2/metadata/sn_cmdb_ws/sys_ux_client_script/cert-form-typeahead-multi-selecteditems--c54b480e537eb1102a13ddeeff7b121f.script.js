/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return [{"id":"values","label": helpers.translateSync('{0} values', api.item.value.inputValues.length)}];
}
