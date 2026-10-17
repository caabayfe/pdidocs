/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    var consumableRecord = api.data.look_up_consumable_record.result;
    var consQty = consumableRecord.quantity.value;
    api.setState('quantity', consQty);
    api.setState('consQty',consQty);
    helpers.translate('Mark for disposal').then(
    	(translatedString) => {
    		api.setState('translatedTitle', translatedString + ': ' + consumableRecord.display_name.value);
    	}
  	);
}
