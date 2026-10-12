/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    var tab = api.context.props.table;
	var displayName = api.data.gliderecord_query_1.output.data.GlideRecord_Query[tab]._results[0].display_name.value;
	var maxQuantity = api.data.gliderecord_query_1.output.data.GlideRecord_Query[tab]._results[0].quantity.value;
	api.setState('displayName', displayName);
	api.setState('maxQuantity', maxQuantity);
  	helpers.translate('Split').then(
    	(translatedString) => {
    		api.setState('translatedTitle', translatedString + ': ' + displayName);
    	}
  	);
}
