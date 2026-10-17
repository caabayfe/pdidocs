/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return {
    icon: 'home-outline',
    tooltipContent: helpers.translateSync('Home')
  };
}
