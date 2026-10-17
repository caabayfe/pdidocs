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
    if (api.context.props.relatedListItemIndex === -1)
        api.emit('NAV_ITEM_SELECTED', {
            title: api.state.viewAllInteractionsTitle,
            route: 'simplelist',
            fields: {
                table: 'interaction'
            },
            params: {
                listTitle: api.state.viewAllInteractionsTitle,
                query: api.state.recentInteractionsQuery
            },
            targetRoute: 'current'
        });
    else {
        if (api.context.props.isSrp)
            api.emit('SOW_INTERACTION#ROUTE_REQUESTED_REQ_INFO', {
                route: 'REL:c954ccb33b501300a0bd8cd834efc4b7',
                type: 'related-list'
            });
        else
            api.emit('CONTENT_UPDATED', {
                params: {
                    'selectedTabIndex': '1',
                    'extraParams': 'subTabIndex/' + api.context.props.relatedListItemIndex,
                }
            });
    }
}
