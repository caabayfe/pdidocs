/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	var showTg = api.state.showTg;
  const activityState = api.data.playbook_activity_ui.playbookCardProperties.activityState.value;
  var inProgress = (activityState !== 'IN_PROGRESS');
  if(inProgress){
    return inProgress;
  } else {
    return showTg;
  }
}
