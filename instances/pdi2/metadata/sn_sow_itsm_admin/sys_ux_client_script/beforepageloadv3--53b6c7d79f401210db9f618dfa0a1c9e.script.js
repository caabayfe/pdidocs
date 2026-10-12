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
    //Following import statement is boiler-plate code for ACE client scripts. Please do not manipulate the next line.
    const aceUtils = imports["sn_ace.ACEClientScriptUtils"](api, helpers);
    //Use this client scrip for beforePage load actions. Use aceUtils Methods, blockContext and contentTree.
    const {

        eventName,
        eventPayload
    } = event.payload;
    var blockcontext = eventPayload.blockContext;
    var dashboards = api.state.availableDashboardsData;
    var dashboardList = dashboards.result.data.entities;
    var availableDashboards = [];
    for (var i = 0; i < dashboardList.length; i++) {
        availableDashboards.push({
            id: dashboardList[i].sys_id,
            label: dashboardList[i].name
        })
    }
    blockcontext.availableDashboards = availableDashboards;
    await aceUtils.setContext(blockcontext, "v3");
    await aceUtils.setContentBlocks(eventPayload.contentTree, "v3");
}
