/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return [{
            "sourceType": "table",
            "tableOrViewName": "sn_cmdb_ws_ms_ci_dashboard_data",
            "filterQuery": "state=2^chart=cis_by_number_of_sources^filter="+api.state.selectedCIFilter,
            "id": "sn_cmdb_ws_ms_ci_dashboard_data_source_2"
        }];
}
