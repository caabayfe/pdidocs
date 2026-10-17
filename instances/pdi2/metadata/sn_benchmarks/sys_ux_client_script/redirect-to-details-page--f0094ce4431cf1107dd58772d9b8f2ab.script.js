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

    var indicatorID = '';
    var indicatorName = '';
    if (event.name == 'NOW_LIST#CELL_LINK_CLICKED') {
        indicatorID = event.payload.cell.id;
        indicatorName = event.payload.cell.label;

    api.setState("selectedIndicatorId", indicatorID);
    api.setState("selectedIndicatorName", indicatorName);    
    api.emit("SET_SELECTED_INDICATOR_DATA_RELAY_f5bc8fd053b32110ec80ddeeff7b12ad", {
        "indicatorId": indicatorID,
        "indicatorName": indicatorName
    });
    }

}
