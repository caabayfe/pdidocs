/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if (!api.state.projectPermissions.promin_project_entity.canDelete) {
    return true;
  }

  if ('mode' in api.state.currentView.params && api.state.currentView.params.mode === 'EDIT') {
    if (api.state.selectedEntity && api.state.selectedEntity.parent_entity.value) {
      return false;
    }
  }

	return true;
}
