/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if(api.state.detailTask.configuration_types === "install_plugin") {
    if(api.state.installPlugins.length > 0) {
      return helpers.translateSync('Install and Continue');
    }
  }

	return helpers.translateSync('Continue');
}
