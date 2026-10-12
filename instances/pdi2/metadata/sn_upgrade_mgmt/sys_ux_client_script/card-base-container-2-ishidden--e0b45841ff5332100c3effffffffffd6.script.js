/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	// DEF0821025: hide while sessionType is unresolved so the Upgrade preview
	// card does not flash on the Bulk App update flow before state loads.
	return !api.state.sessionType || api.state.sessionType === "bulk_app_update";
}
