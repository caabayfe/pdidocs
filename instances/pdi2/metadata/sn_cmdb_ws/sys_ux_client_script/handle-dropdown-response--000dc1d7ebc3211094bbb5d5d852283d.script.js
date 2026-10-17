/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    const {
        buildPAConfig,
        INTEGRATION_EXEC_TREND_TABS
    } = imports['sn_cmdb_ws.cmdbWSIntegrationUtil']();
    const data = api.data.get_integration_dropdown_options.output;
    if (!data || Object.keys(data).length === 0) return;
    const processingRatePaConfig = buildPAConfig(INTEGRATION_EXEC_TREND_TABS[0], data.processingRate.defaultOption);
    const importCountPaConfig = buildPAConfig(INTEGRATION_EXEC_TREND_TABS[1], data.importCount.defaultOption);
    const processingRateConfig = {
        dropdownOptions: data.processingRate.allOptions,
        selectedApps: data.processingRate.defaultOption,
        selectedAppsId: data.processingRate.defaultOption.map(d => d.id),
        paConfig: processingRatePaConfig
    };

    const importCountConfig = {
        dropdownOptions: data.importCount.allOptions,
        selectedApps:data.importCount.defaultOption,
        selectedAppsId: data.processingRate.defaultOption.map(d => d.id),
        paConfig: importCountPaConfig
    };

    api.setState('processingRateConfig', processingRateConfig);
    api.setState('importCountConfig', importCountConfig);
}
