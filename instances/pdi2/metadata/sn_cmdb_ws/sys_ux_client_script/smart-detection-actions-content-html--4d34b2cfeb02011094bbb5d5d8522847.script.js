/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return `<ul><li><strong>CIs detected: </strong>${api.state.smartDetectionCount}</li><li><strong>Most recent discovery: </strong>${api.state.smartDetectionLastDiscovered}</li></ul>`;;
}
