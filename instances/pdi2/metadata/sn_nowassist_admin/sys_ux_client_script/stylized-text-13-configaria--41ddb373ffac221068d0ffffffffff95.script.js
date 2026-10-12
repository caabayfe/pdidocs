/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var skill_name = api.data.get_ui_action_details.output.skillName;
  return helpers.translateSync("Who can access {0} for all the Conversational experiences?" ,skill_name);
}
