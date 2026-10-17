/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const ariaLabel = helpers.translateSync('Repeat until');
	return `{'aria-label': '${ariaLabel}'}`;
}
