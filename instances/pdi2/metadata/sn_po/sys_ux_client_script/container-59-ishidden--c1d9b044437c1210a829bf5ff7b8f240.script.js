/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
		return !Boolean(api.state.advancedConditionForm.fields.transitionConditionType == "TRANSITION" || api.state.advancedConditionForm.fields.transitionConditionType == "CROP" || (api.state.advancedConditionForm.fields.endCondition.value == null && api.state.advancedConditionForm.fields.startCondition.value == null));
}
