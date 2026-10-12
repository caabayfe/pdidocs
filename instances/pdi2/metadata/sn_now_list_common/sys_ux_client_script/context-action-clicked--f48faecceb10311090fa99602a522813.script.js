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
    const {
        context,
        actionItem: {
            id,
            action
        }
    } = event.payload;

    if (!context) return;

    if (action === 'QUICK_EDIT_FORM_OPENED') {
        const { row } = context;
        if(!row?.key) return;
        api.emit('LIST_CTRL#NAVGATION_PANEL_CONTROL', {
            typeOfRecord: 'current',
            sysId: row.key
        });
        const keyArray = row.key?.split('@');
        api.emit('LIST_CTRL#PREVIEW_RECORD_CLICKED', { 
           table: api.state.table, 
           sysId: keyArray[keyArray.length-1]
        });
    } else if (['LIST_CTRL#FILTER_OUT_CLICKED', 'LIST_CTRL#SHOW_MATCHING_CLICKED'].includes(action)) {
        // Cell filter use case
        api.emit('LIST_CTRL#CELL_FILTER_APPLIED', {
            context,
            filterType: id
        });
    } else if (action === 'GROUP_BY_COLUMN') {
        const key = event.payload.context.column?.key;
        if (key) {
            api.emit('LIST_CTRL#GROUP_BY_COLUMN', {
                detail: {
                    payload: { field: key },
                },
            });
        }
    } else if (action === 'SHOW_VISUALIZATION_CLICKED') {
        const key = event.payload.context.column?.key;
        if (key) {
            api.emit('LIST_CTRL#SHOW_VISUALIZATION_CLICKED', {
                field: key
            });
        }
    } else if (action === 'GROUP_SHOW_ALL') {
         api.emit('LIST_CTRL#SHOW_ALL_RECORDS_CLICKED', {
                    context,
         });
    } else if (action === 'GROUP_SHOW_ALL') {
         api.emit('LIST_CTRL#SHOW_ALL_RECORDS_CLICKED', {
                    context,
         });
    } else if (action === 'OPEN_RECORD_CLICKED') {
        const { row } = context;
        if(!row?.key) return;
        const { table, listTitle, columnDefinitions } = api.data?.sn_record_list_data_broker?.out ?? {};

        const columnWithRenderAsLink = columnDefinitions?.columns?.find((column) => column.renderAsLink);
        const openRecordMetadata = row.cells[columnWithRenderAsLink?.key]?.metadata?.openRecordMetadata || {};
        const { displayValue, referenceKeyValue, sysId } = openRecordMetadata;
        
        // Open record if selection disabled and card click open enabled
        api.emit('LIST_CTRL#NAV_ITEM_SELECTED', {
            route: 'record',
            title: listTitle,
            nativeEvent: event,
            row: {
                sys_id: {
                    value: sysId || row.key
                },
                referenceKeyValue: {
                    value: referenceKeyValue || row.key
                },
                displayValue: {
                    value: displayValue || ''
                },
                rowData: {
                    value: row
                }
            },
            sys_id: row.key,
            recordId: row.key,
            table
        });
    } else if (action === 'COLUMN_CALCULATIONS') {
        const key = event.payload.context.column?.key;
        if (!key)  return;
        api.data.sn_record_list_data_broker.metricTracked({ metricName: 'CALCULATE_COLUMN_CONTEXT_MENU', metricPayload: { field: key } });
        api.emit('LIST_CTRL#OPEN_MODAL', {
            route: 'column-calculations',
            size: 'md',
            fields: {
                column: key
            }
        });
    } else if (action === 'UPDATE_PINNED_COLUMNS') {
        let columnPinningInfo = event.payload.context.columnPinningInfo;
        const key = event.payload.context.column?.key;
        const DEFAULT_COLUMN_PINNING_INFO = { start: [], end: [] };
        if (!columnPinningInfo) {
            columnPinningInfo = DEFAULT_COLUMN_PINNING_INFO;
        }
        if (id === 'pin_to_start_column') {
            if (!columnPinningInfo.start.includes(key)) {
                // avoid duplicate column entries in the array
                columnPinningInfo.start.push(key);
            }
        } else if (id === 'pin_to_end_column') {
            if (!columnPinningInfo.end.includes(key)) {
                // avoid duplicate column entries in the array
                columnPinningInfo.end.unshift(key);
            }
        } else if (id === 'unpin_all_columns') {
            columnPinningInfo = DEFAULT_COLUMN_PINNING_INFO;
        } else if (id === 'unpin_column') {
            // check if column is pinned to start or end and remove it from the array
            columnPinningInfo.start = columnPinningInfo.start.filter((item) => item !== key);
            columnPinningInfo.end = columnPinningInfo.end.filter((item) => item !== key);
        }
        if (columnPinningInfo) {
            api.emit('LIST_CTRL#UPDATE_PINNED_COLUMNS', { columnPinningInfo });
        }
    }  else if (action === 'AI_GROUP_SUMMARIZE') {
        api.emit('LIST_CTRL#OPEN_PANEL', {
            route: 'ai-group-summary',
            fields: {
                sysId: event.payload.actionItem.groupSysId,
                groupLabel: event.payload.actionItem.groupedRowLabel,
                groupId: event.payload.actionItem.groupId
            },
        })

    }  else if (action === 'AI_GROUP_VIEW_ALL') {
        api.setState('currentPage',0);
        api.data.sn_record_list_data_broker.resetHeaderAlertConfig();
        api.setState('aiGroupInfo', {
            sysId: event.payload.actionItem.groupSysId,
            groupId: event.payload.actionItem.groupId,
            requestedType: 'single',
            label: event.payload.actionItem.groupedRowLabel
        });
    }
}
