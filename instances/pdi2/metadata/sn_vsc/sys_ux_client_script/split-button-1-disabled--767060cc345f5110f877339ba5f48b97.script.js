/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return (api.state.firstScanDate == null || api.state.secondScanDate == null);
}
