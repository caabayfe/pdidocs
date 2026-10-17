/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if(api.state.detailTask.configuration_types === "install_plugin" || api.state.detailTask.configuration_types === "table") {
    return null;
  }

  return helpers.translateSync('Mark as complete');
}
