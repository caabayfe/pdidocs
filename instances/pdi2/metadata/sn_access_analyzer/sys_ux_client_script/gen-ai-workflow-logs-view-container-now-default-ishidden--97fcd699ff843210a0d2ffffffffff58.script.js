/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const viewType = api?.context?.props?.viewType;
  // Render AI Workflow Log View, if it is ai_workflow
  return viewType === "gen_ai_workflow" ? false: true;
}
