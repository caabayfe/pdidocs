/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    api.emit('NAV_ITEM_SELECTED', {
        route: 'list',
		fields: {'table':event.context.item.value.table,'listTitle':event.context.item.value.title},
		params: {'query':event.context.item.value.query},
		redirect: null,
		passiveNavigation: null,
		title: event.context.item.value.title,
		multiInstField: null,
		targetRoute: null,
		external: null
    });
}
