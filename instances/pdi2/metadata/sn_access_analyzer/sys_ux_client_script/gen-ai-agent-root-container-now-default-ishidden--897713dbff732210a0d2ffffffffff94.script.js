/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const viewType = api?.context?.props?.viewType;
  // Render AI Agent Results View, if it is gen_ai_agent
  return viewType === "gen_ai_agent"? false: true;
}
