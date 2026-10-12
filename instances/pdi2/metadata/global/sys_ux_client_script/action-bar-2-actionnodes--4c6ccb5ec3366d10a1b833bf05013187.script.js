/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	var actionList = [];
  for (const actionNode of api.data.record_1.actions.items) {
    if (actionNode.children[0].label != "Save" && actionNode.children[0].label != "Train") {
      actionList.push(actionNode);
    }
  }
	return actionList;
}
