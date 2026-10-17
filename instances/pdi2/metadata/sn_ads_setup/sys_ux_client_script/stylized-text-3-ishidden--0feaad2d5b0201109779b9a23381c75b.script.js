/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const {configuration_types} = api.state.detailTask;
  if(configuration_types === "install_plugin" || configuration_types === "table") {
    return true;
  }
	return false;
}
