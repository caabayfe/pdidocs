/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
	helpers.modal.close();
	var newAssetSysId = api.data.allocate_1.output;
	if (newAssetSysId) {
		var table = api.context.props.table;
		api.emit('NAV_ITEM_SELECTED', {
			"route": "record",
			"fields": {
				"table": table,
				"sysId": newAssetSysId
			}
		});
	} else {
		api.emit("GFORM#RELOAD");
	}
}
