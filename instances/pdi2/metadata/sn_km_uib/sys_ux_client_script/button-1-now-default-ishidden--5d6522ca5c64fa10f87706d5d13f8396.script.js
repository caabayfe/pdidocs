/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if(api.state.isArticleLoading){
		return true;
	}
  const { overridePageProperties, showBackButton } = api.context.props;
  return overridePageProperties ? !showBackButton : true;
}
