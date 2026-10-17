/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return [{id:"", label:"-- None --", active: true}].concat(api.state.presetActionList || []);
}
