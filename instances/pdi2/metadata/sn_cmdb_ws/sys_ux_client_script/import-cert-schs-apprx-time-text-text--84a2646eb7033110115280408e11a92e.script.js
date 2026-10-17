/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return helpers.translateSync('Approximately {0} remaining to complete the import of Data Certification schedules', api.data.apprxTimeToImportCertSchs);
}
