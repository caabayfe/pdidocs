/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const translatedTab = api.state.reqAttentionTabContent;
  const selectedTab = api.state.reverseTranslations[translatedTab];
  if (selectedTab == "My Flagged" || selectedTab == "Articles expiring in 90 days") {
    const views = api.item.value.meta2;
    return views === 1 ? helpers.translateSync("1 view") : helpers.translateSync("{0} views", views);
  }
	return api.item.value.meta2;
}
