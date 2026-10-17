/**
  * @param {params} param
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return [{
        "maxNumberOfGroups": "ALL",
        "numberOfGroupsBasedOn": "NO_OF_GROUP_BASED_ON_PER_METRIC",
        "showOthers": false,
        "hideZeroValues": false,
        "disableRanges": false,
        "groupBy": [{
            "dataSource": "dGFibGVzdF9saWNlbnNlX2RldGFpbF9tZXRyaWMxNjY5MTYwNjMxMzM4",
            "groupByField": "feature",
            "isRange": false,
            "isChoice": false,
            "isPaBucket": false
        }]
    }];
}
