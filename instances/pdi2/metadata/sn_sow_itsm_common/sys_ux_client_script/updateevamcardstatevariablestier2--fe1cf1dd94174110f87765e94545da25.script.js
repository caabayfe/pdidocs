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
    var serviceDeskUtils = imports['sn_sow_itsm_common.SOWLandingPageTier2Utils']();
    var sowUtils = imports['sn_sow.SowUtils']();
    var nameValueMap = sowUtils.getNameValueMap(event.payload.params.query);
    var currentVizSelection = {};
    var previousVizSelection = {};
    var value = event.context.item.value;
    var payload = event.payload;

    currentVizSelection.table = value.datasource[0].tableOrViewName;
    currentVizSelection.query = payload.params.query + value.updated_on;
    currentVizSelection.elementId = value.id;
    currentVizSelection.recordCount = payload.data.value;
    currentVizSelection.groupByField = value.groupBy[0].groupBy[0].groupByField;
    var querySegments = payload.params.querySegments;
    if (currentVizSelection.table == "task" && payload.data.elements && Array.isArray(payload.data.elements) && payload.data.elements[0] == undefined)
        nameValueMap.sys_class_name = "all";
    currentVizSelection.title = await serviceDeskUtils.fetchTitle(currentVizSelection.table, nameValueMap, api.state.groupMode, value.id);
    if (querySegments && querySegments.length > 0) {
        previousVizSelection = { ...currentVizSelection};
        previousVizSelection.groupBy = payload.data.groupBy[0];
    } else {
        previousVizSelection.elementId = value.id;
    }
    const translations = api.state.translations;
    if (translations.hasOwnProperty(currentVizSelection.title))
        currentVizSelection.title = translations[currentVizSelection.title];

    api.setState('currentVizSelection', currentVizSelection);
    api.setState('previousVizSelection', previousVizSelection);
    api.setState('listRefreshRequested', {
        timestamp: new Date().getTime()
    });
    if (api.state.groupMode)
        api.setState('listView', 'sow_landing_page');
    else
        api.setState('listView', 'sow_landing_page_assigned');
   api.setState('hideList', false);
}
