/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return {
			icon: 'gear-outline',
			description: helpers.translateSync(`<b>Component</b> edited`)
		};
}
