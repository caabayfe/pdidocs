/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    var table = api.context.props.table;
	var sysId = api.data.create_split_asset_transform_1.output;
    api.emit('NAV_ITEM_SELECTED',
		{
			"route": "record",
			"fields": {
				"table": table,
				"sysId": sysId
			}
		}
	);
	helpers.modal.close();
}
