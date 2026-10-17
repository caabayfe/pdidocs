/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if(api.state.skillConfigData.skill_parent) {
    return api.state.skillConfigData.translated_text.activate_modal_duplicated_skill_success_message;
  }

	return api.state.skillConfigData.success_message;
}
