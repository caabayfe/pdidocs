/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({ api }) {
	const { overridePageProperties, showComments } = api.context.props;
	if (api.data.get_article_details_1.articleDetails) {
		if (api.data.get_article_details_1.articleDetails.showFeedbackComments) {
			return overridePageProperties ? !showComments : false;
		}
	}
	return true;
}
