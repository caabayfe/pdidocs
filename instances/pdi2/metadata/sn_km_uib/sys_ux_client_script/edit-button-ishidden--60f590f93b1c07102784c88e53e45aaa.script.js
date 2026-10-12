function evaluateProperty({api}) {
	if(api.data.get_article_details_1.articleDetails)
		return !api.data.get_article_details_1.articleDetails.isEditable;
	return '';
}
