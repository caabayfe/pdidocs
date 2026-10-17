/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const currentEntity = api.item.value;
	if (!Boolean(currentEntity.parentId)) {
    return helpers.translateSync('Primary entity cannot be deleted');
  }
	return helpers.translateSync('Delete');
}
