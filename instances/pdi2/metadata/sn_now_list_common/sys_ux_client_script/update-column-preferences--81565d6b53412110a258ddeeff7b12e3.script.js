function script({ api, event, helpers, imports }) {
    const { listId, columnLimit } =  api.context.props;
    const { table, enableColumnCalculations } =  api.data.sn_record_list_data_broker.out;
    const { selectedListMenuItem } = api.data.sn_record_list_data_broker.out.listMenuModel || {};

    const { getEffectiveView } = imports['sn_now_list_common.ListControllerUtils']();
    let view = getEffectiveView(api);

    const columns = selectedListMenuItem?.columns || api.context.props.columns;
    const { getListColumnPreferences } = imports['sn_now_list_common.ListControllerUtils']();
    const helper = getListColumnPreferences(api);

    const columnData = {...api.data.sn_record_list_data_broker.out?.columnDefinitions?.columns};
    const selectedlistId = api.data.sn_record_list_data_broker.out.listMenuModel.selectedListMenuItem.id;
    const listCondition = api.data.sn_record_list_data_broker.out.concatenatedQuery;
    const listTitle = api.data.sn_record_list_data_broker.out.listTitle;
    const originalColumns = Object.keys(columnData).map(key => ({
            key: columnData[key].key,
            label: columnData[key].label
    }));
    const columnLabel = Object.keys(columnData).map(key => columnData[key].label).join(',');
    const currentListData = {
        title: listTitle,
        table,
        columns: columnLabel,
        conditions: listCondition,
        selectedlistId
    };
    const DEFAULT_COLUMN_PINNING_INFO = { start: [], end: [] };

    function updateColumnsOrder(newColumns) {
        const columnOrder = newColumns.join(',');
        const { targetTable } = selectedListMenuItem || {};
        // if list is a "my list" the columnOrder preference is attached to the listId
        if (listId && targetTable === 'sys_ux_my_list' && columns) {
            if (!!columnOrder) {
                api.data.list_controller__my_list__update.execute({
                    sys_id: listId,
                    columns: columnOrder
                });
            } else {
                const preferences = helper.getColumnOrderDependentPreferences('');
                if (preferences.length > 0) {
                    api.setState('shouldRefreshList', true);
                    helper.saveColumnPreferences(preferences);
                }
            }

        // if this list has column or columnLimit properties set, then columnOrder preference
        // is saved/retrieved from user preference
        } else if (columns || columnLimit > 0) {
            helper.saveColumnOrderUserPref(columnOrder);

        // if neither of the above conditions are true, columnOrder preference is saved
        // and retrieved through column personalization (UI16 method, stored in sys_ui_list record by table/view/user)
        } else {
            /*
            * Works for all the tables with name eg. task
            */
            const relatedListName = api.context.props.relatedListName;
            const relationshipId = relatedListName?.startsWith('REL:') ? relatedListName : '';
            const queryParams = [
                `sysparm_fields=${columnOrder}`,
                `sysparm_view=${view || ''}`,
                `sysparm_parent_table=${api.context.props.parentTable || ''}`,
                `sysparm_relationship_id=${relationshipId}`,
            ].join('&');
            const url = `/api/now/ui/personalize_columns/${table}?${queryParams}`;
            helpers.snHttp(url, { method: 'PATCH', batch: true }).then(() => {
                if (event.name === 'LIST_CTRL#SAVE_EDIT_COLUMNS') {
                    // When removing a column, delete the column width preference server-side
                    const widthsPref = helper.getUpdatedColumnWidthsPreference(newColumns);
                    if (widthsPref) {
                        api.data.save_user_preference.execute(widthsPref);
                    }

                    const oldColumns = Object.keys(columnData).map(key => columnData[key].key);
                    const shouldClearColumnAggregates = !newColumns.length && enableColumnCalculations && !api.state.areColumnsPersonalized && helper.hasSomeColumnAggregatesSelected(oldColumns);
                    // Handles the case when a user clicks on resets all column settings for a non-personalized list that has column aggregates applied.
                    // For the personalized case, upon resets all column settings or reset to column defaults,
                    // the sys_ui_list and sys_ui_list_element(which includes aggregates) records are deleted. so explicit removal is not required.
                    if (shouldClearColumnAggregates)
                        api.emit('LIST_CTRL#CLEAR_ALL_COLUMN_AGGREGATES')
                    else {
                        api.emit('LIST_CTRL#REFRESH_REQUESTED');
                    }
                }
                api.emit('LIST_CTRL#COLUMNS_UPDATED', {newColumns: columnOrder, timestamp: Date.now(), originalColumns, currentListData, update: columnOrder});
            }).catch(({ error }) => console.log(error));
        }
    }

    function updateColumnsWidths(columnsWidths, currentColumnKey) {
        // Reconstruct which columns have been explicitly modified
        // by checking which ones have saved widths in preferences
        const currentWidthsPref = helper.getColumnWidthsPref();

        const savedWidths = (currentWidthsPref?.value && currentWidthsPref.value !== '{}')
            ? JSON.parse(currentWidthsPref.value)
            : {};

        // Build set of modified columns: saved columns + current column being resized
        const modifiedColumnKeys = new Set(
            Object.keys(savedWidths).filter(key => savedWidths[key] && savedWidths[key] !== '')
        );

        // Always include the current column being resized
        if (currentColumnKey) {
            modifiedColumnKeys.add(currentColumnKey);
        }

        const modifiedKeysArray = Array.from(modifiedColumnKeys);

        // Filter to only save explicitly modified columns
        const widthsToSave = {};
        modifiedKeysArray.forEach(key => {
            if (columnsWidths[key] !== undefined) {
                widthsToSave[key] = columnsWidths[key];
            }
        });

        const value = JSON.stringify(widthsToSave);
        helper.saveColumnWidthsUserPref(value);
    }

    function saveColumnPinningInfoUserPref(columnPinningInfo) {
        try {
            const value = JSON.stringify(columnPinningInfo);
            helper.saveColumnPinningUserPref(value);
        } catch (error) {
            console.error('[List Bundle] Error saving column pinning info to user preferences', error);
        }
    }

    function updateColumnPinningInfoUserPrefOnOrderChange(columns, columnPinningInfo) {
        const newColumnPinningInfo = {start:[], end:[]};
        newColumnPinningInfo.start = columns.filter((column) => columnPinningInfo.start.includes(column));
        newColumnPinningInfo.end = columns.filter((column) => columnPinningInfo.end.includes(column));
        saveColumnPinningInfoUserPref(newColumnPinningInfo);
    }

    const { actionType, newColumns = [], columnsWidths = {}, columnPinningInfo, columnKey } = event.payload;

    const pinningInfo = columnPinningInfo || api.data.sn_record_list_data_broker.out.columnDefinitions.columnPinningInfo || DEFAULT_COLUMN_PINNING_INFO;
    switch (event.name) {
        case 'LIST_CTRL#COLUMNS_REORDERED':
            const { columns: oldColumns } = api.data.sn_record_list_data_broker.out.columnDefinitions;
            const oldColumnOrder = oldColumns.map(({key}) => key).join(',');
            const newColumnOrder = newColumns.join(',');
            if (oldColumnOrder !== newColumnOrder) {
                updateColumnsOrder(newColumns);
            } else {
                saveColumnPinningInfoUserPref(pinningInfo);
            }
            break;
        case 'LIST_CTRL#COLUMN_WIDTHS_UPDATED':
            // Pass columnKey (the column being resized) to updateColumnsWidths
            // It reconstructs modifiedColumnKeys from saved preferences
            updateColumnsWidths(columnsWidths, columnKey);
            break;
        case 'LIST_CTRL#SAVE_EDIT_COLUMNS':
            if (actionType === 'reset_column_widths') {
                api.emit('LIST_CTRL#COLUMN_WIDTHS_UPDATED', { columnsWidths: {} });
                api.emit('LIST_CTRL#RESET_COLUMN_WIDTHS', { columnWidths: [] });
            }
            else if (actionType === 'clear_column_aggregates') {
                api.emit('LIST_CTRL#CLEAR_ALL_COLUMN_AGGREGATES');
            }
            else {
                const { columns: oldColumns } = api.data.sn_record_list_data_broker.out.columnDefinitions;
                const union = new Set([...oldColumns.map(({key}) => key), ...newColumns]);
                const isReorderedOnly = oldColumns.length === newColumns.length && union.size === oldColumns.length;
                const isSubset = newColumns.length > 0 && union.size === oldColumns.length;
                if (isReorderedOnly || isSubset && !helper.isColumnWidthsPersonalized())
                    api.emit('LIST_CTRL#COLUMNS_REORDERED', { newColumns });
                else
                    updateColumnsOrder(newColumns);

                updateColumnPinningInfoUserPrefOnOrderChange(newColumns, pinningInfo);
            }
            break;
        case 'LIST_CTRL#UPDATE_PINNED_COLUMNS':
            saveColumnPinningInfoUserPref(columnPinningInfo);
            break;
        default:
            break;
    };
}
