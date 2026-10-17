/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const { playbookDefinitionItem } = api.state;
	return playbookDefinitionItem.length > 0 ? playbookDefinitionItem[0].id : null;
}
