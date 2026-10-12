/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
  function evaluateProperty({api, helpers}) {
    var licensed_val = 0;
    var embedded_val = 0;
    var platform_val = 0;
    var unlicensed_val = 0;
    var xcc_val = 0;
    var orchestration_val = 0;

    try {
        var aggregateQueryData = [];
        if (api && api.data && api.data.transaction_types && api.data.transaction_types.output && api.data.transaction_types.output.data && api.data.transaction_types.output.data.GlideAggregate_Query) {
            aggregateQueryData = api.data.transaction_types.output.data.GlideAggregate_Query;
        } else if (api && api.data && api.data.usage_and_transactions_type_script_1 && api.data.usage_and_transactions_type_script_1.output && api.data.usage_and_transactions_type_script_1.output.transactionTypes) {
            aggregateQueryData = api.data.usage_and_transactions_type_script_1.output.transactionTypes;
        }

        for (var i =0; i < aggregateQueryData.length; i++) {
                if (aggregateQueryData[i] && aggregateQueryData[i].sum !== "" && aggregateQueryData[i].groupBy && aggregateQueryData[i].groupBy[0] && aggregateQueryData[i].groupBy[0].displayValue) {
                    var displayValue = aggregateQueryData[i].groupBy[0].displayValue;
                    if (displayValue.startsWith("IntegrationHub")) {
                        licensed_val = licensed_val + parseInt(aggregateQueryData[i].sum);
                    } else if (displayValue.startsWith("platform")) {
                        platform_val = platform_val + parseInt(aggregateQueryData[i].sum);
                    }else if (displayValue === "unlicensed") {
                        unlicensed_val = unlicensed_val + parseInt(aggregateQueryData[i].sum);
                    } else if(displayValue !== "" && displayValue !== "Unknown") {
                        embedded_val = embedded_val + parseInt(aggregateQueryData[i].sum);
                    }
                }
            }
            if(api && api.data && api.data.xcc_query && api.data.xcc_query.output && api.data.xcc_query.output.data && api.data.xcc_query.output.data.GlideAggregate_Query && api.data.xcc_query.output.data.GlideAggregate_Query[0] && api.data.xcc_query.output.data.GlideAggregate_Query[0].count) {
                xcc_val = api.data.xcc_query.output.data.GlideAggregate_Query[0].count;
            }
            //orchestration_results_query
            if(api && api.data && api.data.orchestration_results_query && api.data.orchestration_results_query.output && api.data.orchestration_results_query.output.data && api.data.orchestration_results_query.output.data.GlideAggregate_Query && api.data.orchestration_results_query.output.data.GlideAggregate_Query[0] && api.data.orchestration_results_query.output.data.GlideAggregate_Query[0].count) {
                orchestration_val = api.data.orchestration_results_query.output.data.GlideAggregate_Query[0].count;
            }

    } catch (e) {
        console.log(e);
    }
    if (embedded_val === 0) {
        return [
        {
            "data": [
                {
                    "assignment_group": "Integration Hub",
                    "value": licensed_val
                },
                {
                    "assignment_group": "Platform",
                    "value": platform_val
                },
                {
                    "assignment_group": "Unlicensed",
                    "value": unlicensed_val
                },
                {
                    "assignment_group": "External Content Connectors",
                    "value": xcc_val
                },
                {
                    "assignment_group": "Orchestration",
                    "value": orchestration_val
                }
            ],
            "metadata": {
                "dataSourceLabel": helpers.translateSync("Transactions by Type"),
                "eventData": {
                    "table": "ua_ih_usage"
                },
                "groupBy": [
                    {
                        "series": [
                            {
                                "id": "value",
                                "type": "value",
                                "label": "Transactions"
                            }
                        ],
                        "elements": [
                            {
                                "id": "d625dccec0a8016700a222a0f7900d06",
                                "label": "Integration Hub"
                            },
                            {
                                "id": "8a4dde73c6112278017a6a4baf547aa7",
                                "label": "Platform"
                            },
                            {
                                "id": "287ebd7da9fe198100f92cc8d1d2154e",
                                "label": "Unlicensed"
                            },
                            {
                                "id": "287ee6fea9fe198100ada7950d0b1b73",
                                "label": "External Content Connectors"
                            },
                            {
                                "id": "36c741fa731313005754660c4cf6a70d",
                                "label": "Orchestration"
                            }
                        ],
                        "id": "assignment_group",
                        "fieldType": "reference",
                        "label": "Assignment group"
                    }
                ],
                "format": {
                    "unitFormat": "{0}"
                },
                "aggregateBy": 4,
                "metricId": "ZEdGaWJHVnBibU5wWkdWdWRERTJORFl5TXpRMk5qYzBORE09MTY0NjIzNDY2OTQzMw=="
            }
        }
    ];
    } else {
        return [
        {
            "data": [
                {
                    "assignment_group": "Integration Hub",
                    "value": licensed_val
                },
                {
                    "assignment_group": "Embedded",
                    "value": embedded_val
                },
                {
                    "assignment_group": "Platform",
                    "value": platform_val
                },
                {
                    "assignment_group": "Unlicensed",
                    "value": unlicensed_val
                },
                {
                    "assignment_group": "External Content Connectors",
                    "value": xcc_val
                },
                {
                    "assignment_group": "Orchestration",
                    "value": orchestration_val
                }
            ],
            "metadata": {
                "dataSourceLabel": helpers.translateSync("Transactions by Type"),
                "eventData": {
                    "table": "ua_ih_usage"
                },
                "groupBy": [
                    {
                        "series": [
                            {
                                "id": "value",
                                "type": "value",
                                "label": "Transactions"
                            }
                        ],
                        "elements": [
                            {
                                "id": "d625dccec0a8016700a222a0f7900d06",
                                "label": "Integration Hub"
                            },
                            {
                                "id": "8a5055c9c61122780043563ef53438e3",
                                "label": "Embedded"
                            },
                            {
                                "id": "8a4dde73c6112278017a6a4baf547aa7",
                                "label": "Platform"
                            },
                            {
                                "id": "287ebd7da9fe198100f92cc8d1d2154e",
                                "label": "Unlicensed"
                            },
                            {
                                "id": "287ee6fea9fe198100ada7950d0b1b73",
                                "label": "External Content Connectors"
                            },
                            {
                                "id": "36c741fa731313005754660c4cf6a70d",
                                "label": "Orchestration"
                            }
                        ],
                        "id": "assignment_group",
                        "fieldType": "reference",
                        "label": "Assignment group"
                    }
                ],
                "format": {
                    "unitFormat": "{0}"
                },
                "aggregateBy": 4,
                "metricId": "ZEdGaWJHVnBibU5wWkdWdWRERTJORFl5TXpRMk5qYzBORE09MTY0NjIzNDY2OTQzMw=="
            }
        }
    ];
    }
}
