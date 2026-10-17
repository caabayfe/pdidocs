/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return {
    label: helpers.translateSync('Filters that have been applied to this list and cannot be removed or modified.'),
    style: "italic",
    variant: "secondary"
  };
}
