/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  let relatedTableConfigDetails = api.state.relatedTableConfigSelected;
  let translatedLabels = api.data.get_translated_labels.output;
  let htmlFormatted = relatedTableConfigDetails.map(item => {
    const tableName = item.tableName;
    const ignoreErrors = item.ignore_errors == 1? translatedLabels.TRUE: translatedLabels.FALSE;
    const skipBusinessRules = item.skip_business_rules == 1? translatedLabels.TRUE: translatedLabels.FALSE;
    return `<b>${tableName}</b> (<b>${translatedLabels.SKIP_BUSINESS_RULES}:</b> ${skipBusinessRules} <b>${translatedLabels.IGNORE_ERRORS}:</b> ${ignoreErrors})<br/>`;
  }).join('');
  return {
    "type": "html", 
    "value": `<p>${translatedLabels.MERGE_RELATED_ITEMS_INFO_MESSAGE} <a href="api/now/v1/context_doc_url/manage-related-items-list" target="_blank"> ${translatedLabels.MANAGE_RELATED_TABLES_CONFIGURATION}</a><br/><br/> ${translatedLabels.MERGE_RELATED_ITEMS_CURRENT_SETTING_MESSAGE}: <br/>${htmlFormatted}</p>` 
    };
}
