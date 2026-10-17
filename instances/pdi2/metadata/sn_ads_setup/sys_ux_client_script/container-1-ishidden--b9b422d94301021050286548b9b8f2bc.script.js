/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const playbookCardProperties = api.data.playbook_activity_ui.playbookCardProperties;
  const activityStatus = playbookCardProperties && playbookCardProperties.activityState.value;
	return  activityStatus == 'COMPLETE' || !api.state.plugins.length;
}
