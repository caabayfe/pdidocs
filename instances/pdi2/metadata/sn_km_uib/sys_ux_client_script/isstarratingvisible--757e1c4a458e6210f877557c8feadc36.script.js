/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  * Determines if the star rating should be hidden based on the article details and context properties.
  */
function evaluateProperty({api, helpers}) {
	if(api.data.get_article_details_1.articleDetails){
		const articleData = api.data.get_article_details_1.articleDetails;
		const { overridePageProperties, showStarRatingAction } = api.context.props;
		if(articleData.showFeedbackOptions && articleData.showStarRating){
			if(overridePageProperties){
				return !showStarRatingAction;
			}
			return false;
		}
	}
	return 'true';
}
