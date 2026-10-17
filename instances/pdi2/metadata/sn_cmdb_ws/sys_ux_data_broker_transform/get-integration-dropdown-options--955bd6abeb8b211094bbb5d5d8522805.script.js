function transform() {
    var util = new sn_cmdb_ws.CMDBWsPerfInsightsUtil();
    var gr = util.getIntegrationAggDataGr('', util.COLS.APPLICATION);

    if (!gr.hasNext()) {
        return {};
    }

    var OUTLIER = gs.getMessage("Outlier");
    var NON_OUTLIER = gs.getMessage("Non-outlier");

    var result = {
        processingRate: {
            allOptions: [],
            defaultOption: null
        },
        importCount: {
            allOptions: [],
            defaultOption: null
        }
    };

    var processingRateOutlierApplications = [];
    var processingRateNonOutlierApplications = [];
    var importCountOutlierApplications = [];
    var importCountNonOutlierApplications = [];

    var _aggData = [];
    var _appIds = {};
    var _appIdToName = {};

    while (gr.next()) {
        var feature = gr.getValue(util.COLS.CHART);
        var count = gr.getValue(util.COLS.COUNT);
        var applicationId = gr.getValue(util.COLS.APPLICATION);
        var hasOutlier = count > 0;
        _aggData.push({
            feature: feature,
            applicationId: applicationId,
            hasOutlier: hasOutlier
        });
        _appIds[applicationId] = true;
    }

    var uniqueAppIds = Object.keys(_appIds);

    while (uniqueAppIds.length > 0) {
        var appGr = new GlideRecord(util.TABLES.CMDB_INST_APPLICATION);
        appGr.addQuery(util.COLS.SYS_ID, "IN", uniqueAppIds.splice(0, 1000));
        appGr.query();

        while (appGr.next()) {
            _appIdToName[appGr.getUniqueValue()] = appGr.getDisplayValue();
        }
    }

    for (var d in _aggData) {
        var feature = _aggData[d].feature;
        var applicationId = _aggData[d].applicationId;
        var hasOutlier = _aggData[d].hasOutlier;
        var label = _appIdToName[applicationId];

        var dropdownOption = {
            id: applicationId,
            label: label
        };

        if (feature === util.SUB_CATEGORY.INTEGRATION_PROCESSING_RATE_OUTLIER) {
            if (hasOutlier) {
                processingRateOutlierApplications.push(dropdownOption);
            } else {
                processingRateNonOutlierApplications.push(dropdownOption);
            }
        } else if (feature === util.SUB_CATEGORY.INTEGRATION_ROWS_OUTLIER) {
            if (hasOutlier) {
                importCountOutlierApplications.push(dropdownOption);
            } else {
                importCountNonOutlierApplications.push(dropdownOption);
            }
        }
    }

    if (processingRateOutlierApplications.length > 0) {
        result.processingRate.allOptions.push({
            id: 'processing_rate_outlier',
            label: OUTLIER,
            children: processingRateOutlierApplications
        });
    }

    if (processingRateNonOutlierApplications.length > 0) {
        result.processingRate.allOptions.push({
            id: 'processing_rate_non_outlier',
            label: NON_OUTLIER,
            children: processingRateNonOutlierApplications
        });
    }

    if (importCountOutlierApplications.length > 0) {
        result.importCount.allOptions.push({
            id: 'import_count_outlier',
            label: OUTLIER,
            children: importCountOutlierApplications
        });
    }

    if (importCountNonOutlierApplications.length > 0) {
        result.importCount.allOptions.push({
            id: 'import_count_non_outlier',
            label: NON_OUTLIER,
            children: importCountNonOutlierApplications
        });
    }

    result.processingRate.defaultOption = [result.processingRate.allOptions[0].children[0]];
    result.importCount.defaultOption = [result.importCount.allOptions[0].children[0]];

    return result;
}
