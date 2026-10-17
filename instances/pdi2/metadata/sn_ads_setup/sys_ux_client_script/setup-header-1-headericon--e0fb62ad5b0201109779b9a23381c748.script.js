/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return {
    icon: 'chevron-left-fill',
    tooltipContent: helpers.translateSync('Back')
  };
}
