/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	const playbooksContextIds = api.data.playbook_custom_layout.playbookContextIdsInOrder || [];
  if(!playbooksContextIds.length) return [];
	const latestContextId = playbooksContextIds[playbooksContextIds.length -1];
  return [latestContextId];
}
