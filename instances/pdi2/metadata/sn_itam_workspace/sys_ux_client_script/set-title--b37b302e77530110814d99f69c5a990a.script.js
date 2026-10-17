/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
	var consumableRecord = api.data.look_up_consumable_record.result;
    helpers.translate('Retire Asset').then(
    	(translatedString) => {
    		api.setState('translatedTitle', translatedString + ': ' + consumableRecord.display_name.value);
    	}
  	);
}
