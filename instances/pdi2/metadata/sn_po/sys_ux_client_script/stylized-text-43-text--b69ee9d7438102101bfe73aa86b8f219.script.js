/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const { currentUseCase } = api.state;

  let tableName = '';

  if (currentUseCase === 'includeApprovals') {
    tableName = helpers.translateSync('Approval');
  } else if (currentUseCase === 'includeSLABreach') {
    tableName = helpers.translateSync('Task SLA');
  } else if (currentUseCase.startsWith('createChildTable')) {
    tableName = currentUseCase.split(':')[2];
  }

	return helpers.translateSync('Turning off will remove the entity - {0} and all its associated configurations from your scope.', tableName);
}
