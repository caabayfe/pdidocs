/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({ api }) {
	const articleDetails = api.data?.get_article_details_1?.articleDetails;
	if (!articleDetails) return [];
	const secondaryFields = articleDetails.secondaryFields;
	const { overridePageProperties, showReadingTime, showViewCount, showLastUpdated, showAverageRating } = api.context.props;
	return overridePageProperties ? secondaryFields.filter(field => (field.column !== 'timeToRead' || showReadingTime) && (field.column !== 'viewCount' || showViewCount) && (field.column !== 'sysUpdatedOn' || showLastUpdated) && (field.column !== 'rating' || showAverageRating)) : secondaryFields;
}
