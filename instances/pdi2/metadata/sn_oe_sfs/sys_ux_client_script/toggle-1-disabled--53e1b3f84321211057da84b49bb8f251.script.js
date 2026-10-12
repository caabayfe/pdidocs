/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var records = api.data.consumer_account_context_records.results || [];

    records.forEach(record => {
        if (records.is_default.value) {
          return false;
        }
    });
	return true;
}
