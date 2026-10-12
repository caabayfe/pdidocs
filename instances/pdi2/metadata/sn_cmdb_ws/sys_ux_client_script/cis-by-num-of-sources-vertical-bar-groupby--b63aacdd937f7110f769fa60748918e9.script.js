/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return [{
            "groupBy": [{
                "dataSource": "sn_cmdb_ws_ms_ci_dashboard_data_source_2",
                "groupByField": "key"
            }]
        }];
}
