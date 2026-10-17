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
    if (api.context.props.assetsRelatedListItemIndex === -1)
        api.emit('NAV_ITEM_SELECTED', {
            title: api.state.assetsHeader,
            route: 'simplelist',
            fields: {
                table: 'alm_asset'
            },
            params: {
                listTitle: api.state.assetsHeader,
                query: "assigned_to=" + api.state.openedForSysId + "^assigned_to !=" + "5136503cc611227c0183e96598c4f706" + "^install_status != 7"
            },
            targetRoute: 'current'
        });
    else {
        if (api.context.props.isSrp)
            api.emit('SOW_INTERACTION#ROUTE_REQUESTED_REQ_INFO', {
                route: 'REL:e32c8b0353602110ad0fddeeff7b12ef',
                type: 'related-list'
            });
        else
            api.emit('CONTENT_UPDATED', {
                params: {
                    'selectedTabIndex': '1',
                    'extraParams': 'subTabIndex/' + api.context.props.assetsRelatedListItemIndex,
                }
            });
    }
}
