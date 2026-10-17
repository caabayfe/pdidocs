/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return `The ServiceNow ${api.context.props.patch || ""} release includes new products and applications, as well as additional features and fixes for existing products. Read the release notes to learn about the release, prepare for your upgrade, and upgrade your instance.`;
}
