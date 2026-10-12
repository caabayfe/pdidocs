/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    var SYSID_LENGTH = 32;
    var consumableRec = api.data.look_up_consumable_record.result;
        
    var stockroomParam = api.state.stockroom;
    if (stockroomParam.length !== SYSID_LENGTH || (stockroomParam !== '' && stockroomParam === consumableRec.stockroom.value)) {
        api.setState('stockroomName', consumableRec.stockroom.displayValue);
    } else {
        api.setState('stockroomId', stockroomParam);
    }
    helpers.translate('Consume').then(
    	(translatedString) => {
    		api.setState('translatedTitle', translatedString + ': ' + consumableRec.display_name.value);
    	}
  	);
}
