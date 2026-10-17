/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return api?.data?.nowllm_supported_languages?.output.filter(i=> i.provider == api.context?.props?.provider)[0].providerName;
}
