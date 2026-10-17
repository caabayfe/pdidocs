/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return api.state.collapsed 
        ? {"aria-label": helpers.translateSync("Expand")}
        : {"aria-label": helpers.translateSync("Collapse")};
}
