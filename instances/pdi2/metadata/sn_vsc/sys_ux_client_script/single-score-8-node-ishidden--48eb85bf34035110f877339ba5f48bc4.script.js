/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var plugin = api.data.vsc_biometric_plugin_status_1.output;
  return !(plugin.active);
}
