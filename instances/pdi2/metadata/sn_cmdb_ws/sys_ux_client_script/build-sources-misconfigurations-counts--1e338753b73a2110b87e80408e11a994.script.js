/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    const {
        buildFieldMetadata
    } = imports["sn_cmdb_ws.cmdbWSCommonUtil"]();

    const rawData = api?.data?.get_integration_sources_related_misconfigurations?.output;

    if (!rawData)
        return;

    let integrationDataSources = {};
    integrationDataSources.list = rawData["integration_data_sources"];
    
    let batchImportTurnedOffCounts = [];
    let concurrentImportTurnedOffCounts = [];
    let nonCustomPartionMethodCounts = [];

    const TOTAL = await helpers.translate('Total');
    const ON = await helpers.translate('sn_cmdb_ws.on.sentenceCase');
    const OFF = await helpers.translate('Off');
    const NON_CUSTOM = await helpers.translate('Non-custom size');

    let item = {};
    item.label = TOTAL;
    item.displayValue = rawData["total_sources"];
    let metadata = buildFieldMetadata(item);
    batchImportTurnedOffCounts.push(metadata);

    item = {};
    item.label = TOTAL;
    item.displayValue = rawData["total_sources_with_sch_import_set"];
    metadata = buildFieldMetadata(item);
    concurrentImportTurnedOffCounts.push(metadata);
    nonCustomPartionMethodCounts.push(metadata);

    item = {};
    item.label = ON;
    item.displayValue = rawData["sources_batch_import_on"];
    batchImportTurnedOffCounts.push(buildFieldMetadata(item));

    item = {};
    item.label = OFF;
    item.displayValue = rawData["sources_batch_import_off"];
    batchImportTurnedOffCounts.push(buildFieldMetadata(item));

    item = {};
    item.label = ON;
    item.displayValue = rawData["sources_concurrent_import_on"];
    concurrentImportTurnedOffCounts.push(buildFieldMetadata(item));

    item = {};
    item.label = OFF;
    item.displayValue = rawData["sources_concurrent_import_off"];
    concurrentImportTurnedOffCounts.push(buildFieldMetadata(item));

    item = {};
    item.label = NON_CUSTOM;
    item.displayValue = rawData["sources_non_custom_size_partition_method"];
    nonCustomPartionMethodCounts.push(buildFieldMetadata(item));

    integrationDataSources.batchImportTurnedOffCounts = batchImportTurnedOffCounts;
    integrationDataSources.concurrentImportTurnedOffCounts = concurrentImportTurnedOffCounts;
    integrationDataSources.nonCustomPartionMethodCounts = nonCustomPartionMethodCounts;

    api.setState("integrationDataSources", integrationDataSources);
}
