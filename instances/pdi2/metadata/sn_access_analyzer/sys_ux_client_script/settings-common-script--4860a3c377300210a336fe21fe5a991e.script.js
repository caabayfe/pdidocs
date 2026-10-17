/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    const VIEWPORT_LOAD_REQUESTED_EVENT = "MACROPONENT_VIEWPORT_LOAD_REQUESTED";
    const MACROPONENT_READY_EVENT = "MACROPONENT_READY";
    const VIEWPORT_ID = "viewport_1";
    const ACCESS_SIMULATOR_SETTING_TAB = "simulator-settings";
    const ACCESS_INSIGHTS_SETTING_TAB = "access-insights";

    const onPageReady = async () => {
        let settingsTabs = {};
        settingsTabs.items = [{
                id: ACCESS_SIMULATOR_SETTING_TAB,
                label: await helpers.translate("Access Simulator")
            },
            {
                id: ACCESS_INSIGHTS_SETTING_TAB,
                label: await helpers.translate("Access Insights")
            }
        ];
        let setting = api.context.props.setting;
        let selectedTab = [ACCESS_SIMULATOR_SETTING_TAB, ACCESS_INSIGHTS_SETTING_TAB].includes(setting) ?
                setting : ACCESS_SIMULATOR_SETTING_TAB;
        settingsTabs.selectedItems = [[selectedTab]];
        api.setState("settingsTabs", settingsTabs);
        loadViewport(selectedTab);
    };

    const loadViewport = (route) => {
        api.emit(VIEWPORT_LOAD_REQUESTED_EVENT, {
            viewportElementId: VIEWPORT_ID,
            route: route
        });
    };

    const onTabChange = () => {
        loadViewport(event.payload.item.id);
    };

    if (event.name === MACROPONENT_READY_EVENT) {
        onPageReady();
        return;
    }

    ({
        settings_tabs: onTabChange
    } [event.elementId])();
}
