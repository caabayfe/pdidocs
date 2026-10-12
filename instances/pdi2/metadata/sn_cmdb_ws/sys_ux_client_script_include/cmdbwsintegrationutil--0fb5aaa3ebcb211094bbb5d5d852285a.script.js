function include({
    imports
}) {
    var INTEGRATION_EXEC_TREND_TABS = [
        'PROCESSING_RATE',
        'IMPORT_COUNT'
    ];

    var INTEGRATION_EXEC_TREND_INDICATORS = {
        PROCESSING_RATE: {
            'id': "408aaad2ebf2211094bbb5d5d85228bd",
            'breakdownId': "482ac39eeb36211094bbb5d5d852285e"
        },
        IMPORT_COUNT: {
            'id': 'b43b2616ebf2211094bbb5d5d8522828',
            'breakdownId': '482ac39eeb36211094bbb5d5d852285e'
        }
    };

    function _buildPAConfig(selectedTab, selectedApps) {
        var selectedAppsId = [];
        for (var i in selectedApps) {
            selectedAppsId.push(selectedApps[i].id);
        }
        var indicatorConfig = INTEGRATION_EXEC_TREND_INDICATORS[selectedTab];
        var paConfig = {
            "showConfidenceBand": selectedApps.length === 1,
            "trendBy": {
                "trendByFrequency": "date",
                "trendByFields": [{
                    "field": "anything",
                    "metric": "YVc1a2FXTmhkRzl5WTJKa09Ua3lPVGsyTURVeVlUVTFNR1k0TnpjM01qQXpOR1EwTkRNelpETXhOamd5TlRVd01qTTJPRGt3MTY4MjU1MDIzODE4OA=="
                }]
            },
            "groupBy": selectedApps.length === 1 ? null : [{
                "groupBy": [{
                    "dataSource": "aW5kaWNhdG9yY2JkOTkyOTk2MDUyYTU1MGY4Nzc3MjAzNGQ0NDMzZDMxNjgyNTUwMjM2ODkw",
                    "groupByField": indicatorConfig.breakdownId,
                    "isRange": false,
                    "isChoice": false,
                    "isPaBucket": false
                }]
            }],
            "metrics": [{
                "dataSource": "aW5kaWNhdG9yY2JkOTkyOTk2MDUyYTU1MGY4Nzc3MjAzNGQ0NDMzZDMxNjgyNTUwMjM2ODkw",
                "id": "YVc1a2FXTmhkRzl5WTJKa09Ua3lPVGsyTURVeVlUVTFNR1k0TnpjM01qQXpOR1EwTkRNelpETXhOamd5TlRVd01qTTJPRGt3MTY4MjU1MDIzODE4OA==",
                "aggregateIndicator": "",
                "frequency": 10,
                "numberFormat": {
                    "customFormat": false
                },
                "label" : selectedApps.length === 1 ? selectedApps[0].label : "",
                "axisId": "primary"
            }],
            "datasource": [{
                "allowRealTime": true,
                "allowTotalValue": false,
                "indicatorType": "1",
                "isScriptedIndicator": false,
                "sourceType": "indicator",
                "uuid": {
                    "breakdowns": [{
                        "sysId": indicatorConfig.breakdownId,
                        "elementSysIds": selectedAppsId
                    }],
                    "indicator": indicatorConfig.id
                },
                "id": "aW5kaWNhdG9yY2JkOTkyOTk2MDUyYTU1MGY4Nzc3MjAzNGQ0NDMzZDMxNjgyNTUwMjM2ODkw",
                "dataCategories": ["trend", "group", "simple"]
            }]
        };
        return paConfig;
    }

    return {
        INTEGRATION_EXEC_TREND_TABS,
        INTEGRATION_EXEC_TREND_INDICATORS,
        buildPAConfig: _buildPAConfig
    };
}
