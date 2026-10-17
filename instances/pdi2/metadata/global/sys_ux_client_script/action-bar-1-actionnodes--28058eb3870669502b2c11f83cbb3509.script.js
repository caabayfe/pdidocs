/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var actionList = [];
  for (const actionNode of api.data.simulation_form.nowRecordCommonUiactionbar.actionNodes) {
    if (actionNode.children[0].uxActionType != "UIAction") {
      actionList.push(actionNode);
    }
  }
	return actionList;
}
