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

    const selectedAppsId = event.payload.value;
    if (selectedAppsId.length <= 0) {
        return;
    }
    const selectedTabIndex = api.context.props.selectedTabIndex;

    const updateState = (stateVar) => {
        const selectedTab = INTEGRATION_EXEC_TREND_TABS[selectedTabIndex];
        const allOptions = api.state[stateVar].dropdownOptions.flatMap(m => m.children);
        const selectedApps = allOptions.filter(d => selectedAppsId.includes(d.id));
        const paConfig = buildPAConfig(selectedTab, selectedApps);
        api.setState(stateVar, ({ currentValue }) => {
            return {
                ...currentValue,
                paConfig,
                selectedApps,
                selectedAppsId
            };
        });
    };

    if (selectedTabIndex == 0) {
        updateState('processingRateConfig');
    } else {
        updateState('importCountConfig');
    }
}
