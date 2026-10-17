/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api}) {
	if(api.state.isArticleLoading){
		return true;
	}
	const { overridePageProperties, showArticleActions } = api.context.props;
	if (api.data.get_article_details_1.articleDetails) {
		return overridePageProperties ? !showArticleActions : '';
	}
	return '';
}
