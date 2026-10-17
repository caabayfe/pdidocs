/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if (api.context.props.subSelectedTabIndex == "1") {
	  return helpers.translateSync('Are you sure you want to delete the selected {0} draft policies? This action can\'t be undone.', api.data.dmPoliciesController?.recordSelection?.selectionCount);
  } else if (api.context.props.subSelectedTabIndex == "2") {
	  return helpers.translateSync('Are you sure you want to delete the selected {0} de-activated policies? This action can\t be undone.', api.data.dmPoliciesController?.recordSelection?.selectionCount);
  }
}
