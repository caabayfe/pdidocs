/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    const {
        FORM_ICONS,
        goBackToPrevStep
    } = imports["sn_cmdb_ws.ManualCreateCIUtil"](...arguments);

    const {
        WARNING_NOTIFICATION_PROPS,
        showNotificationWithAutoClose
    } = imports["sn_cmdb_ws.CMDBWsNotificationUtil"]();
    let {
        labelsTooltips,
        leftNavItems,
        selectedTabId
    } = api.state;

    let currViewIndex = leftNavItems.findIndex(x => x.id == selectedTabId);
        //go back to select_class nav
    goBackToPrevStep(leftNavItems, currViewIndex, FORM_ICONS);
    labelsTooltips.continueBtnTooltip = await helpers.translate("Select a class with at least 1 IRE rule to continue");

    helpers.navigate.setRouteParams({'params' : {
        'sysClassName' : ''
    }});

    api.setState("tempSelectedClass", "");
    api.setState("selectedClass", "");

    let notifications = [{
        ...WARNING_NOTIFICATION_PROPS,
        id: 'warningId' + new Date().valueOf(),
        content: await helpers.translate('The {0} class has 0 IRE rules. Please select a class with at least 1 IRE rule.', [table])
    }];
    showNotificationWithAutoClose({ api, helpers }, notifications);
    api.setState("labelTooltips", labelsTooltips);
}
