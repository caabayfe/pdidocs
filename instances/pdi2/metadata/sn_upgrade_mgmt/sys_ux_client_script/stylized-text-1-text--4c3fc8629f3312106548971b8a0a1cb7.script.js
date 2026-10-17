/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const translatedString = helpers.translateSync("Upgrade from {0} to {1}",api.context.props.currentVersion,api.context.props.targetVersion);
		return translatedString;
}
