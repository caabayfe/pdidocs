/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {

    var txPoolUsage = 0;
    var txLicensedUsage = 0;

    try {
        if (api && api.data && api.data.ih_pool_usage && api.data.ih_pool_usage.output && api.data.ih_pool_usage.output.data && api.data.ih_pool_usage.output.data.GlideAggregate_Query && api.data.ih_pool_usage.output.data.GlideAggregate_Query[0] && api.data.ih_pool_usage.output.data.GlideAggregate_Query[0].sum) {
            txPoolUsage = api.data.ih_pool_usage.output.data.GlideAggregate_Query[0].sum;
        } else if (api.data.usage_and_transactions_type_script_1 && api.data.usage_and_transactions_type_script_1.output && api.data.usage_and_transactions_type_script_1.output.usage) {
            txPoolUsage = api.data.usage_and_transactions_type_script_1.output.usage;
        }
        //xcc results query
        if(api && api.data && api.data.xcc_query && api.data.xcc_query.output && api.data.xcc_query.output.data && api.data.xcc_query.output.data.GlideAggregate_Query && api.data.xcc_query.output.data.GlideAggregate_Query[0] && api.data.xcc_query.output.data.GlideAggregate_Query[0].count) {
            txPoolUsage = parseInt(txPoolUsage) + api.data.xcc_query.output.data.GlideAggregate_Query[0].count;
        }
        //orchestration query
        if(api && api.data && api.data.orchestration_results_query && api.data.orchestration_results_query.output && api.data.orchestration_results_query.output.data && api.data.orchestration_results_query.output.data.GlideAggregate_Query && api.data.orchestration_results_query.output.data.GlideAggregate_Query[0] && api.data.orchestration_results_query.output.data.GlideAggregate_Query[0].count) {
            txPoolUsage = parseInt(txPoolUsage) + api.data.orchestration_results_query.output.data.GlideAggregate_Query[0].count;
        }
        if (api && api.data && api.data.ems_route_1.output) {
            if(api && api.data && api.data.ems_purchase_count_1 && api.data.ems_purchase_count_1.output){
                txLicensedUsage = api.data.ems_purchase_count_1.output;
            }
        } else {
            if (api && api.data && api.data.ih_transactions_count && api.data.ih_transactions_count.results && api.data.ih_transactions_count.results[0] && api.data.ih_transactions_count.results[0].count && api.data.ih_transactions_count.results[0].count.value) {
                txLicensedUsage = api.data.ih_transactions_count.results[0].count.value;
             } else if (api.data.usage_and_transactions_type_script_1 && api.data.usage_and_transactions_type_script_1.output && api.data.usage_and_transactions_type_script_1.output.txLicense) {
                txLicensedUsage = api.data.usage_and_transactions_type_script_1.output.txLicense;
             }
        }
    } catch (e) {
        console.log(e);
    }

    return [{
        "data": [{
                "use_count": "TX license",
                "value": txLicensedUsage
            },
            {
                "use_count": "TX license Usage",
                "value": txPoolUsage
            }
        ],
        "metadata": {
            "dataSourceLabel": helpers.translateSync("IntegrationHub usage"),
            "eventData": {
                "table": "ua_ih_usage"
            },
            "groupBy": [{
                "series": [{
                    "id": "value",
                    "type": "value",
                    "label": "Use Count"
                }],
                "elements": [{
                        "id": "d625dccec0a8016700a222a0f7900d06",
                        "label": "TX license Usage"
                    },
                    {
                        "id": "8a5055c9c61122780043563ef53438e3",
                        "label": "TX license"
                    }
                ],
                "id": "use_count",
                "fieldType": "reference",
                "label": helpers.translateSync("IntegrationHub usage")
            }],
            "format": {
                "unitFormat": "{0}"
            },
            "aggregateBy": 4,
            "metricId": "ZEdGaWJHVnBibU5wWkdWdWRERTJORFl5TXpRMk5qYzBORE09MTY0NjIzNDY2OTQzMw=="
        }
    }];
}
