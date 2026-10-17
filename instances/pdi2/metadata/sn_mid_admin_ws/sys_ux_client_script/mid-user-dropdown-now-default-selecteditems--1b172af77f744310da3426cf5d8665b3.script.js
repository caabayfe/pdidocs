/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	  var val = api.state.midUserLookup;
    if (val) {
        return [val];
    }
    return [];
}
