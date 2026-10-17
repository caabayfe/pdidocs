/**
 * Generic re-dispatch for node-map events with 'edge' in payload
 * as controller events with resolved merged `edges`.
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
	const {translateEventPayload} = imports['sn_app_ux_commons.nodeMapExpandedGroups']();
	const {sourceEvent, ...origPayload} = event.payload;
	const {ctx, lastRequestedSelectionId} = api.state;
	const newPayload = translateEventPayload(origPayload, ctx, lastRequestedSelectionId);

	const eventName = `SN_NODE_MAP_UNIFIED_CTRL#${sourceEvent}`;
	api.emit(eventName, newPayload);
}
