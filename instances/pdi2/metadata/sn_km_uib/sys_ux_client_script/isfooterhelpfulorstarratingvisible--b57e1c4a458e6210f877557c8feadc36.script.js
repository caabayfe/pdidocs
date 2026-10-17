/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.imports
 * Determines if the feedback options (helpful action or star rating) should be hidden based on the article details and context properties.
 */
function evaluateProperty({
    api
}) {
    const articleData = api.data.get_article_details_1.articleDetails;
    const { overridePageProperties, showHelpfulAction, showStarRatingAction } = api.context.props;
    if (articleData) {
        if ((articleData.showFeedbackOptions && articleData.showStarRating) || (articleData.showFeedbackOptions && articleData.showYNRating))
        {
            return overridePageProperties ? !(showHelpfulAction || showStarRatingAction) : false;
        }
    }
    return true;
}
