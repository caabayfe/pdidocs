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

  const childTables = [...entityUseCasesMap[selectedEntityId].childTables];

  const matchingTable = childTables.find(ct => ct.name === api.item.value.name);

  if (!matchingTable) {
    return false;
  }

  return matchingTable.value;
}
