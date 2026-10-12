/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if ('mode' in api.state.currentView.params && api.state.currentView.params.mode === 'EDIT') {
    return api.state.selectedEntity.table.displayValue;
  }
	return helpers.translateSync('New child entity');
}
