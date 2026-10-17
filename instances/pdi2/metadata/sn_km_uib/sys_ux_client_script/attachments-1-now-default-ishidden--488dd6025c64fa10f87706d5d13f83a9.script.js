/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api}) {
	if(api.data.get_article_details_1.articleDetails) {
		const {displayAttachments, hasAttachments} = api.data.get_article_details_1.articleDetails.articleInfo;
		const { overridePageProperties, showAttachments } = api.context.props;
		if ((displayAttachments && hasAttachments)) {
			return overridePageProperties ? !showAttachments : false;
		}
		return true;
	}
}
