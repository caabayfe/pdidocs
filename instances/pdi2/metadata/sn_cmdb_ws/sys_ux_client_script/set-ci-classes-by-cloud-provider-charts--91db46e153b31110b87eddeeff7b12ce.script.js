/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if (api.state.selectedTabIndex == 1 && api.state.cloudServicesChartConfigs.length == 0) {
        let ciClasses = [];
        if (api.data.get_cloud_and_noncloud_assets_data.output && api.data.get_cloud_and_noncloud_assets_data.output.ci_classes) {
            ciClasses = api.data.get_cloud_and_noncloud_assets_data.output.ci_classes;
        }
        
        let cloudServicesChartConfigs = [];

        for (let ciClass of ciClasses) {
            let cloudServicesChartConfig = {};

            cloudServicesChartConfig.title = ciClass;
            cloudServicesChartConfig.dataSource = [{
                "allowRealTime": true,
                "sourceType": "table",
                "tableOrViewName": "sn_cmdb_ws_product_insight_data",
                "filterQuery": "state=2^ci_category.ci_class=" + ciClass,
                "reportSourceSysId": null,
                "id": "y91bauoGsBR8q04eJYvp+A8lh9870UAMmKvPO8Ti/Rw="
            }];

            cloudServicesChartConfig.metrics = [{
                "dataSource": "y91bauoGsBR8q04eJYvp+A8lh9870UAMmKvPO8Ti/Rw=",
                "label": "CMDB Insight Data",
                "id": "bzhc2u4f6Vu3XHMikNJcrLoTlgwKF7vAECR/NxzBEiI=",
                "aggregateFunction": "SUM",
                "numberFormat": {
                    "customFormat": true,
                    "decimalPrecision": 1
                },
                "axisId": "primary",
                "aggregateField": "count"
            }];

            cloudServicesChartConfig.groupBy = [{
                "groupBy": [{
                    "dataSource": "y91bauoGsBR8q04eJYvp+A8lh9870UAMmKvPO8Ti/Rw=",
                    "groupByField": "cloud_provider",
                    "isRange": false,
                    "isChoice": true,
                    "isPaBucket": false
                }]
            }];

            cloudServicesChartConfigs.push(cloudServicesChartConfig);
        }
        api.setState('cloudServicesChartConfigs', cloudServicesChartConfigs);
    }
}
