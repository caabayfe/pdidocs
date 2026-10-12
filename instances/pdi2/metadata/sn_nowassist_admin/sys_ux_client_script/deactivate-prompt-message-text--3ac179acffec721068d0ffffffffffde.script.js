/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return helpers.translateSync("Deactivate {skillName}? This will deactivate the skill for your users.", {skillName: api.state.modalTitle});

}
