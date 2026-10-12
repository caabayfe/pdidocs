/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  * Determines whether the helpful feedback section should be displayed based on article details and override page properties paramter
  */
function evaluateProperty({api}) {
	if(api.data.get_article_details_1.articleDetails){
		const articleData = api.data.get_article_details_1.articleDetails;
		const { overridePageProperties, showHelpfulAction } = api.context.props;
		if(articleData.showFeedbackOptions && articleData.showYNRating){
			if(overridePageProperties){
				return !showHelpfulAction;
			}
			return false;
		}
	}
	return true;
}
