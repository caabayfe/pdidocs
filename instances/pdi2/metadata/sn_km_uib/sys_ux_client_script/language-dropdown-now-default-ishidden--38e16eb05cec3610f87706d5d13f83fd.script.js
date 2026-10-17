/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api}) {
	const { overridePageProperties, showLanguageSelector } = api.context.props;
	if(api.data.get_article_details_1.articleDetails) {
		if(api.data.get_article_details_1.articleDetails.languageDetails.length> 1) {
			return overridePageProperties ? !showLanguageSelector : false;
		}
	}
	return 'true';
}
