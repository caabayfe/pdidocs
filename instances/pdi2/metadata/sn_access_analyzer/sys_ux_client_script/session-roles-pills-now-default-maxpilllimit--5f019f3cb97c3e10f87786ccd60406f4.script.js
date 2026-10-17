/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  /**
   * This is to set the limit to maximum number possible, close to INFINITY.
   * The "Pills" component doesn't allow us otherwise.
  */
	return Number.MAX_SAFE_INTEGER;
}
