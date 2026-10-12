/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return helpers.translateSync('as of ' + api.data.duplicate_articles_scheduled_job.results[0].sys_created_on.displayValue);
}
