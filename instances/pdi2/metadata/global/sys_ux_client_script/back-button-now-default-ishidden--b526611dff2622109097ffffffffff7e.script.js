/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var selectedTab = api.data.rule_management_dmc.selectedTabId;
  if(!selectedTab) return;
  if(selectedTab.includes('basic_information')) return true;
	else return false;
}
