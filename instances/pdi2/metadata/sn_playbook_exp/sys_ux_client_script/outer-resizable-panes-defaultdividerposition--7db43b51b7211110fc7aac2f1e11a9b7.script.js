/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({ api, helpers }) {
	return api.state.show_config_panel ? api.state.divider_position : 100;
}
