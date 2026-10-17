/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var text = '';
  if (api.state.isUpdatedByAI) {
    text = helpers.translateSync("Article updated by AI");
  } else if (api.state.wasGenAiGenerated || (api.state.isGenAiGenerated && !api.state.isGenAiModified)) {
    text = helpers.translateSync("Article drafted by AI");
  }
  return text;  
}
