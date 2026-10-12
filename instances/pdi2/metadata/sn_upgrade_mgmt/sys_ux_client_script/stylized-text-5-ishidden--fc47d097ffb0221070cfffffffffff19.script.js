/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const skippedRecordsAvailable = !api.state.loadingSkippedRecordsCount;
  const summaryAvailable = !api.state.summaryStatus || api.state.summaryStatus === 'complete';
	
  return !(skippedRecordsAvailable && summaryAvailable);
}
