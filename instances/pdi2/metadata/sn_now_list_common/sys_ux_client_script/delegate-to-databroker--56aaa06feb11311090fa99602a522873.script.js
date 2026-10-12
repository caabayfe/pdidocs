/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({ api, event, helpers, imports }) {
    const { validateDirtyStatus } = imports[
        'sn_now_list_common.ListControllerUtils'
    ]();
    if (validateDirtyStatus(...arguments)) return;

    const { name, payload } = event;

    switch (name) {
        case 'LIST_CTRL#SET_PAGE':
            const { currentPage } = event.payload;
            const prevPage = api.data.sn_record_list_data_broker.out.currentPage;
            if (currentPage !== prevPage) {
                api.data.sn_record_list_data_broker.setPage({
                    currentPage
                });
                api.emit('LIST_CTRL#PAGE_UPDATED', {
                    page: currentPage,
                    prevPage: prevPage,
                    table: api.data.sn_record_list_data_broker.out.table,
                });
            }
            break;
        case 'LIST_CTRL#SET_PAGE_SIZE':
            const pageSize = event.payload.pageSize;
            const prevSize = api.data.sn_record_list_data_broker.out.rowLimit;
            if (pageSize !== prevSize) {
                api.data.sn_record_list_data_broker.setPageSize({
                    rowLimit: pageSize
                });
                api.data.save_user_preference.execute({
                    name: "rowcount",
                    value: pageSize
                });
                api.emit('LIST_CTRL#ROW_LIMIT_UPDATED', {
                    limit: pageSize,
                    prevLimit: prevSize,
                    table:api.data.sn_record_list_data_broker.out.table,
                });
            }
            break;
        case 'LIST_CTRL#OPEN_EDIT_COLUMNS_MODAL':
            api.data.sn_record_list_data_broker.openEditColumnsModal();
            break;
        case 'LIST_CTRL#MENU_ITEM_CLICKED':
            if (payload.isPrimaryClick) {
                api.data.sn_record_list_data_broker.menuItemClicked({
                    selectedItem: payload.selectedItem,
                    menuClickFromBrowserNav: payload.menuClickFromBrowserNav,
                });
                api.setState('isMultiEditFormOpen', false);
            } else {
                api.emit('LIST_CTRL#MENU_ITEM_SECONDARILY_CLICKED', {
                    item: payload.selectedItem,
                    isList: !payload.selectedItem.children, // DEF0778231
                    children: payload.selectedItem.children
                });
            }
            break;
        case 'LIST_CTRL#SEARCH_REQUESTED':
            api.data.sn_record_list_data_broker.applyZingSearch({
                searchText: payload.searchText,
            });
            break;
        case 'LIST_CTRL#REFRESH_REQUESTED':
            api.data.sn_record_list_data_broker.refreshRequested({
                hideLoader: payload.hideLoader,
                fromButton: payload.fromButton
            });
            break;
        case 'LIST_CTRL#GROUP_BY_COLUMN': {
            const {
                detail: {
                    payload: { field: columnName },
                },
            } = payload;
            api.data.sn_record_list_data_broker.applyGroupby({ columnName });
            break;
        }
        case 'LIST_CTRL#COLUMN_HEADER_FILTER_APPLIED':
            const { columnName, value, operator, action } = payload;
            api.data.sn_record_list_data_broker.applyColumnHeaderFilter({
                columnName,
                value,
                operator,
                action,
            });
            break;
    }
}
