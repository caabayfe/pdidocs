/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const { name, id } = api.item.value;
  // Some plugin names are like "@servicenow/now-visual-board", which collides with Seismic's
  // 'selectable props' syntax and doesn't work, so handling this case specially
	return `${name && name.indexOf('@') === -1 ? name : id }`;
}
