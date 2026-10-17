/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({
    api
}) {
	if (!api.data.get_article_details_1.articleDetails || !api.data.get_article_details_1.articleDetails.languageInfo)
		return; 

	let languageInformation = api.data.get_article_details_1.articleDetails.languageInfo;
    let languages = languageInformation.langVersions;
    let selectedLanguageId = languageInformation.selectedLangVersion;
    let selectedLanguage = languages.find(language => language.id == selectedLanguageId);
    let value = '';

	if(selectedLanguage)
		 value = "Language " + selectedLanguage.label + ", Select to choose other available languages of the article";
    
    return {
        "aria-label": value
    };
}
