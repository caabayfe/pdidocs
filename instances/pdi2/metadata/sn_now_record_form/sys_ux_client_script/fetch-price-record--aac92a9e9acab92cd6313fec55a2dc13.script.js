/**
* fetch the price record
* @param {params} params
* @param {api} params.api
* @param {event} params.event
*/
function script({api, event}) {
  const { table, field, currentRecordId } = event.payload;
  const queryConditions = `table=${table}^field=${field}^id=${currentRecordId}^parentISEMPTY`;
  api.data.get_price_record_info.execute({ queryConditions });
}
