/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return !api?.state?.openVARoleSection || !api?.state?.selectedCE?.some(item => item?.id === "va");
}
