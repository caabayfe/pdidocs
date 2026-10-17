/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if (api.state.topicsAcl.read.length != 0 || api.state.topicsAcl.readwrite.length != 0 ) {
    return 'lock-fill';
  }

	return null;
}
