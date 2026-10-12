/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if(api.context.props.templateInput.subscriptionsTableHideLinks === undefined) {
    return true;
  } else {
	return api.context.props.templateInput.subscriptionsTableHideLinks;
  }
}
