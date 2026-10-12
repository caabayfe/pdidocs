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
    let payload = {
        route: 'list',
        fields: {
            'table': api.context.props.table
        },
        params: {},
		reload: true
    };

    if (api.context.props.t) {
        payload.params.t = api.context.props.t;
    }
    if (api.context.props.view) {
        payload.params.view = api.context.props.view;
    }
    if (api.context.props.filter) {
        payload.params.filter = api.context.props.filter;
    }
    if (api.context.props.fixedFilter) {
        payload.params.fixedFilter = api.context.props.fixedFilter;
    }

    api.emit('NAV_ITEM_SELECTED', payload);
}
