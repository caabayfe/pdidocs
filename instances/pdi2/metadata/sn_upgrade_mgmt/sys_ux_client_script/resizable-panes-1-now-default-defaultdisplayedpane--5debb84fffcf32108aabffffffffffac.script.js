/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if (!api.data.playbook_custom_layout_1.compactMode) return "both";
  return (api.data.playbook_custom_layout_1.selectedItem || {}).stageContextId ? "right" : "left";
}
