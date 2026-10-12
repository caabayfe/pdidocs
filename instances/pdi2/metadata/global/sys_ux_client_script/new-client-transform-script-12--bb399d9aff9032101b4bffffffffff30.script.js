/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var actionArray = [];
  var action = {};
  action.label = helpers.translateSync('Reset filters');
  action.variant = "secondary";
  action.tooltipContent = action.label;
  actionArray.push(action);
	return actionArray;
}
