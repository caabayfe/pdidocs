function transform(input) {
    var query = "";
    var reportConfiguration = {};

    if (GlidePluginManager.isActive('com.snc.cmdb.csdm.activation')) {
        query = "active=true^lifecycle_phase=end_of_life^start_dateONThis year@javascript:gs.beginningOfThisYear()@javascript:gs.endOfThisYear()^lifecycle_type=publisher^model.life_cycle_stageNOT INEnd of Life^model.life_cycle_stage_statusNOT INRetired,Sold";
    } else {
        query = "active=true^lifecycle_phase=end_of_life^start_dateONThis year@javascript:gs.beginningOfThisYear()@javascript:gs.endOfThisYear()^lifecycle_type=publisher^model.statusNOT INRetired,Sold";
    }

    var hardwareLifeCycleEOL = {};
    hardwareLifeCycleEOL.dataSource = [{
        "isDatabaseView": false,
        "allowRealTime": true,
        "label": "Hardware Model Lifecycle",
        "sourceType": "table",
        "tableOrViewName": "cmdb_hardware_model_lifecycle",
        "filterQuery": query,
        "reportSourceSysId": null,
        "id": "dGFibGVjbWRiX2hhcmR3YXJlX21vZGVsX2xpZmVjeWNsZTE2MjY3OTExOTI3MzA="
    }];

    hardwareLifeCycleEOL.metrics = [{
        "dataSource": "dGFibGVjbWRiX2hhcmR3YXJlX21vZGVsX2xpZmVjeWNsZTE2MjY3OTExOTI3MzA=",
        "id": "Y21kYl9oYXJkd2FyZV9tb2RlbF9saWZlY3ljbGVDT1VOVDE2MzQ1MTU2ODA=",
        "aggregateFunction": "COUNT",
        "numberFormat": {
            "customFormat": false
        },
        "axisId": "primary"
    }];

    var consumableLifeCycleEOL = {};
    consumableLifeCycleEOL.dataSource = [{
        "isDatabaseView": false,
        "allowRealTime": true,
        "label": "Consumable Model Lifecycle",
        "sourceType": "table",
        "tableOrViewName": "cmdb_consumable_model_lifecycle",
        "filterQuery": query,
        "reportSourceSysId": null,
        "id": "dGFibGVjbWRiX2NvbnN1bWFibGVfbW9kZWxfbGlmZWN5Y2xlMTYyNjc5MTM2NzI4OA=="
    }];

    consumableLifeCycleEOL.metrics = [{
        "dataSource": "dGFibGVjbWRiX2NvbnN1bWFibGVfbW9kZWxfbGlmZWN5Y2xlMTYyNjc5MTM2NzI4OA==",
        "id": "Y21kYl9jb25zdW1hYmxlX21vZGVsX2xpZmVjeWNsZUNPVU5UMTYzNDUxNTY4MA==",
        "aggregateFunction": "COUNT",
        "numberFormat": {
            "customFormat": false
        },
        "axisId": "primary"
    }];

    reportConfiguration.hardwareLifeCycleEOL = hardwareLifeCycleEOL;
    reportConfiguration.consumableLifeCycleEOL = consumableLifeCycleEOL;

    return reportConfiguration;
}
