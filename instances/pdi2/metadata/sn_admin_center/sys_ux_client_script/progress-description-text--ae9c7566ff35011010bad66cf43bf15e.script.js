/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return api.item.value.installedApplications + '/' + api.item.value.totalApplications + ' recommended applications installed';
}
