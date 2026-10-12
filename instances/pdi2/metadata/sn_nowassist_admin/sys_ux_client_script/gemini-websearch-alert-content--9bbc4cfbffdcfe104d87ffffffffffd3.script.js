/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  
  const warning = api.data.check_for_skill_using_websearch_and_gemini_1.output.warningMessage;
  return {"type":"html", "value": warning};
}
