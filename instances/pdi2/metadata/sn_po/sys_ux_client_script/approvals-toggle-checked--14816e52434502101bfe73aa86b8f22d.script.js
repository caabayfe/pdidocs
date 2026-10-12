/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const { selectedEntity, entityUseCasesMap } = api.state;

  if (!selectedEntity || !selectedEntity.table) {
    return false;
  }

  const selectedEntityId = selectedEntity._row_data.uniqueValue;

  if (!selectedEntityId in entityUseCasesMap) {
    return false;
  }

  return entityUseCasesMap[selectedEntityId].includeApprovals.value;

}
