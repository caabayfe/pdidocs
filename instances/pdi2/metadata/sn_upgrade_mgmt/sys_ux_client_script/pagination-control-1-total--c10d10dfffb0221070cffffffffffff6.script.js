/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	var aggCount = api.data?.aggregation_query_1?.output?.data?.GlideAggregate_Query?.[0]?.count || 0;
	// Bulk-app-update: aggregation_query_1 queries upgrade_mgmt_skipped_record_owner
	// which is empty for bulk sessions; fall back to totalSkippedRecords (set by FromAPI).
	var bulkCount = parseInt(api.state.totalSkippedRecords || 0, 10);
	return bulkCount > 0 ? bulkCount : aggCount;
}
