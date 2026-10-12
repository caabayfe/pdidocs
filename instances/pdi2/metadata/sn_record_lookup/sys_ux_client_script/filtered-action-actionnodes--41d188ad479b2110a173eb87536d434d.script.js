/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const actionItems = api.data?.record?.actions?.items || [];
  if (actionItems.length < 1) return actionItems;
  const filteredItems = actionItems.filter(item => {
    if (item.children[0].action.name == 'sysverb_ws_save')
      return true;
  });
	return filteredItems;
}
