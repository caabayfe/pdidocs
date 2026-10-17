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
        route: 'record',
        fields: {
            'table': api.context.props.table,
            'sysId': api.context.props.sysId,
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
    if (api.context.props.query) {
        payload.params.query = api.context.props.query;
    }
    if (api.context.props.selectedTabIndex) {
        payload.params.selectedTabIndex = api.context.props.selectedTabIndex;
    }

    api.emit('NAV_ITEM_SELECTED', payload);
}
