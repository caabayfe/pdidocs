/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api,imports}) {
    api.setState("selectedRows",{});
    api.setState("isUpgradeTableLoading", true);
    api.setState("shouldDisableScheduleBtn", true);
    api.setState('shouldDisableUpdateBtn', true);
    api.setState('shouldDisableDeleteScheduled', true);
    
    // Reset sort icons
    const {
        resetSortIcons
    } = imports["sn_upgrade_mgmt.NowListTableUtils"]();

    api.setState("columnsDefinitions", resetSortIcons(api.state.columnsDefinitions));

    api.data.get_app_upgrade_list_1.refresh();
}
