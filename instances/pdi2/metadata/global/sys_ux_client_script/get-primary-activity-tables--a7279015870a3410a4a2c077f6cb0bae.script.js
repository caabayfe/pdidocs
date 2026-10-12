/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
  var activity_tables = [{"label" : "--None--","id" : "--None--"}];
	helpers.snHttp('/api/now/doc/table/schema', {method: 'GET'})
    .then(({response}) => {
		if (response && response && response.result) {
			var tablesSchema = response.result;
			if (tablesSchema.length > 0) {
				var tables = tablesSchema.map(function (table) {
					return {
						"label" : table.label + ' [' + table.value + ']',
						"id" : table.value
					};
				});
				activity_tables = activity_tables.concat(tables);
        api.setState("activity_tables", activity_tables);
			}
		}
    })
    .catch(({error}) => {
      const message = `Error: ${error.data.error.message}`;
      console.error(message);
      api.setState("activity_tables", activity_tables);
      api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
        id: 'alert5',
        status: 'high',
        icon: 'info-circle-outline',
        content: message,
        action: { type: 'dismiss' }
    });
  });
}
