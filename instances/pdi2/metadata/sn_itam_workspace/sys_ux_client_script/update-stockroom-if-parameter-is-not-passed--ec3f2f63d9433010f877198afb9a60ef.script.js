/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    var SYSID_LENGTH = 32;
    var consumableRecord = api.data.look_up_consumable_record.result;
    var stockroomParam = api.state.currentStockroom;
    if (stockroomParam.length !== SYSID_LENGTH && stockroomParam !== '')
        api.setState('currentStockroom', consumableRecord.stockroom.value);
    helpers.translate('Cancel from disposal').then(
        (translatedString) => {
            api.setState('translatedTitle', translatedString + ': ' + consumableRecord.display_name.value);
        }
    );
}
