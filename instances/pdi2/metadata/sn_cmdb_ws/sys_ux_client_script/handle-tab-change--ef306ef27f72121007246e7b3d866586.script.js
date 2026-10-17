/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({ api, event, helpers, imports }) {
    let {
        selectedTabIndex, selectedTabLabel
    } = event.payload;
    if (!selectedTabLabel || !api.data.certCtrl?.taskData?.tabConfig) {
        return;
    }
    var tabData = api.data.certCtrl.taskData.tabConfig.find(o => o.label === selectedTabLabel);
    api.setState('listTitle', tabData?.label);
    api.setState('selectedTabIndex', selectedTabIndex);
    api.setState('fixedFilter', tabData?.fields?.rlQuery);
}
