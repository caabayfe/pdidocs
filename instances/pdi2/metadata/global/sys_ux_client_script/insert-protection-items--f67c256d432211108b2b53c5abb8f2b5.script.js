/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var listItems = [{"id":"log","label":"Only log the attempt"},{"id":"no_block_no_log","label":"Don't block and don't log the attempt"}];
	
  if (api.item.value.table.value != 'sysevent' && (api.item.value.table.value == 'syslog_app_scope' || !api.data.look_up_table_extensions.tableExtensions.tableExtensions.includes(api.item.value.table.value))) {
    listItems.unshift({"id":"block_and_log","label":"Block and log the attempt"}, {"id":"block","label":"Only block the attempt"});
  }

  return listItems;
}
