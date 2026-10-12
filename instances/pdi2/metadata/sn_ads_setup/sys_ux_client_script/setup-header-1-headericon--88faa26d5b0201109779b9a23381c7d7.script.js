/**
  * @param {params} params
  * @param {api} params.api
  * @param {any} params.imports
  */
function evaluateProperty({api, helpers}) {
	return {
    icon: 'home-outline',
    tooltipContent: helpers.translateSync('Home')
  };
}
