/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	if(api.data.check_adaptive_authentication_plugin.output){
    return api.state.translations.identity_center_subheading.plugin_active;
  }
  return api.state.translations.identity_center_subheading.plugin_inactive;
}
