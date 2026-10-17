/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  // Render AI Agent Logs View, if it is ai_agent
  const viewType = api?.context?.props?.viewType;
  return viewType === "gen_ai_agent"? false: true;
}
