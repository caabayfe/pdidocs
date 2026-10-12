/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	if (api.state.selectionCount > 1) {
    return 'Deleting will remove them from the sys_trigger table.';
  } else {
    return 'Deleting will remove it from the sys_trigger table.';
  }
}
