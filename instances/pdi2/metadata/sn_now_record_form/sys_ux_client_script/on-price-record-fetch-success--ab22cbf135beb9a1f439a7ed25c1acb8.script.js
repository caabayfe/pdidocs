/**
* fetch the price record
* @param {params} params
* @param {api} params.api
* @param {event} params.event
*/
function script({api, event}) {
  const priceResults = event.payload.data?.output?.data?.GlideRecord_Query?.price?._results;
  if (!priceResults?.length) return;
  const sysId = priceResults[0].sys_id?.value;
  if (!sysId) return;
	api.emit("CTRL_RECORD#RELAY_OPEN_RECORD", { table: 'fx_price', sys_id: sysId });
}
