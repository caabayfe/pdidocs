/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	let lastCommunication = api.item.value.last_communication.value + "Z"; // UTC date time string
  return new Date(lastCommunication).valueOf(); // time in milliseconds since epoch in UTC
}
