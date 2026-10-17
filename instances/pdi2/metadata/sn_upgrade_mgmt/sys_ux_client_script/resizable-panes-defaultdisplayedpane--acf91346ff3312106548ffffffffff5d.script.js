/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	if (!api.data.playbook_custom_layout.compactMode) return "both";
  return (api.data.playbook_custom_layout.selectedItem || {}).stageContextId ? "bottom" : "top";
}
