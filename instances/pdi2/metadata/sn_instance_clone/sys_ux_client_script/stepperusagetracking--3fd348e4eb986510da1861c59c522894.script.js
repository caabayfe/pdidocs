/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({
	api,
	event,
	helpers,
	imports
}) {

	const { telemetryData } = api.context.props.payload;
	if (telemetryData && telemetryData.disable)
		return;

	const payload = {...event.payload.item};
	if (telemetryData && telemetryData.append_to_payload) {
		payload = {
			...payload,
			...telemetryData.append_to_payload
		};
	}

	api.emit('MACROPONENT_TRACK_USAGE_REQUESTED', {
		event: "Progress Step Clicked",
		value: {
			payload
		}
	});
}
