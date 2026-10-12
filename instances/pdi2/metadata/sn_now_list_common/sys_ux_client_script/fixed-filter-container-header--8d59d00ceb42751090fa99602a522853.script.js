/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return {
    label: helpers.translateSync('Fixed filters'),
    size: "sm",
    variant: "primary"
  };
}
