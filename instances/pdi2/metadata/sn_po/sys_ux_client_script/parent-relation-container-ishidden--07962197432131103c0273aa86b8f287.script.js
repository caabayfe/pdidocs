/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  // Hide MDM fields (parent type, relation type) for root entity
  const selectedEntity = {...api.state.selectedEntity};
  if (selectedEntity && selectedEntity.parent_entity) {
    return !selectedEntity.parent_entity.value;
  }
  return false;
}
