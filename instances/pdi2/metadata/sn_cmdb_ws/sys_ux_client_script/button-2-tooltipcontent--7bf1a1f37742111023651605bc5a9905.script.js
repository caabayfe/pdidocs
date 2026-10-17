/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var tooltip = "Next Step";
  if(!api.data.ms_allow_query_edit.output) {
    tooltip = "You are not authorized to modify queries";
  }
	return tooltip;
}
