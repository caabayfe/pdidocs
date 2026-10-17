/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return api?.item?.value?.textInput ? api?.item?.value?.textInput: api?.item?.value?.sampleText;
}
