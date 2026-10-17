/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({ api, helpers }) {
	return {
    minRatio: api.state.show_config_panel ? 20 : 0, 
    minPixels: api.state.show_config_panel ? 100 : 0
  };
}
