/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	var emptyStateHeading={};
  emptyStateHeading.label=api.context.props.errorHeading;
  return JSON.stringify(emptyStateHeading);
}
