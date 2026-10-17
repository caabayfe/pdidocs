/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return 'Latest version is: ' + api.data.clone_help_resource_1.output.latestVersion;
}
