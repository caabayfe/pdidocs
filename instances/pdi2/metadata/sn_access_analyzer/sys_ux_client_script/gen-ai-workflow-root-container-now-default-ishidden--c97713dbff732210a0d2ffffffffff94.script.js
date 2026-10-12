/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const viewType = api?.context?.props?.viewType;
  // Render AI Workflow Results View, if it is gen_ai_workflow
  return viewType === "gen_ai_workflow" ? false: true;
}
