/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const { selectedExample, permissions } = api.state;

  if (selectedExample === 'custom_finding_example') {
    return !permissions.promin_finding_def.canCreate;
  }

	return !permissions.promin_automated_finding.canCreate;
}
