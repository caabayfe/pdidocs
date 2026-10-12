/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	if (api.state.advancedConditionForm.fields.transitionConditionType  == 'TRANSITION') {
    return helpers.translateSync('A transition filter helps focus on process paths that contain a specific transition between selected steps. For example, mine records that transitioned from State: "Work in Progress" to State: "On Hold."');
  }
  
  return helpers.translateSync('The crop process trims the view to display only activities between your defined start and end points. For example: only show the process map between New and Resolved states leaving out the closed state.');
}
