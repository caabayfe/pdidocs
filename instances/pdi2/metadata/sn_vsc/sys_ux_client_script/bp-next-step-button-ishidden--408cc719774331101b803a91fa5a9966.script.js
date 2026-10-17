/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return api?.data?.get_bp_steps_completed_1?.output?.totalSteps === api?.data?.get_bp_steps_completed_1?.output?.completedSteps;
}
