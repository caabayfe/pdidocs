/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
    const consumedAssistsLabel = helpers.translateSync('Total used assists');
    const totalPurchaseLabel = helpers.translateSync('Total purchased');
    //The chart will display the counts as of upto 2 days ago and as of upto > 368 days which is 2 days prior to last 365 days so that the chart displays data over a period of 365 days
	return [
        {
            "allowRealTime": true,
            "dataCategories": [
                "trend",
                "group",
                "simple"
            ],
            "filterQuery": "last_syncRELATIVEGT@dayofweek@ago@368^last_syncRELATIVELT@dayofweek@ago@2",
            "id": "dGFibGVzbl9lbnRpdGxlbWVudF9nZW5haV9hc3Npc3RfYW5hbHl0aWNzMTcwOTI0NDU2MDQzNw==",
            "isDatabaseView": false,
            "label": consumedAssistsLabel,
            "preferredVisualizations": [
                "d24d53f60350de7a652caf3188a46ed2"
            ],
            "reportSourceSysId": null,
            "sourceType": "table",
            "tableOrViewName": "sn_entitlement_genai_assist_analytics"
        },
        {
            "allowRealTime": true,
            "dataCategories": [
                "trend",
                "group",
                "simple"
            ],
            "filterQuery": "last_syncRELATIVEGT@dayofweek@ago@368^last_syncRELATIVELT@dayofweek@ago@2",
            "id": "dGFibGVzbl9lbnRpdGxlbWVudF9nZW5haV9hc3Npc3RfYW5hbHl0aWNzMTcwOTI0NTQ5NzI5NQ==",
            "isDatabaseView": false,
            "label": totalPurchaseLabel,
            "preferredVisualizations": [
                "d24d53f60350de7a652caf3188a46ed2"
            ],
            "reportSourceSysId": null,
            "sourceType": "table",
            "tableOrViewName": "sn_entitlement_genai_assist_analytics"
        }
    ];
}
