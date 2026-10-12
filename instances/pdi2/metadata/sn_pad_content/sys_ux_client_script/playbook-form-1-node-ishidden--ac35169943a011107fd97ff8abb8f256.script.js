/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return api.data.playbook_activity_ui.playbookCardProperties.activityState.value != 'IN_PROGRESS';
}
