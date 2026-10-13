/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
const { startDate, endDate } = api.context.props;
	api.emit('NAV_ITEM_SELECTED', {
		route: 'funnel-builder',
		fields: null,
		params: {
			startDate,
			endDate
		}
	});
}
