/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    const uiConstants = imports["sn_instance_clone.InstanceCloneUIConstants"]();
    const colTypeLabelMap = api.data.gliderecord_dictionary_query_1.output.colTypeLabelMap;
    const activity = api.state.activity || '';
    const return_fields = api.state.return_fields;

    const overviewLabels = {
        'target_instance': 'Target Instance',
        'completed': 'Last Clone',
        'source_instance': 'From Source',
        'duration': 'Duration',
        'state': 'Clone Result'
    };
    const cloneActLabels = {
        'change_number': 'CHG',
        'request_id': 'Request ID',
        'source_instance': 'Source Instance',
        'target_instance': 'Target Instance',
        'state': 'State (WIP, Complete, Error etc)',
        'clone_percent_complete': '% Complete',
        'scheduled': 'Scheduled Date/Time',
        'completed': 'Completed',
        'duration': 'Duration',
        'estimated_clone_duration': 'Estimated Clone Duration',
        'started': 'Started'
    };
    const labelOverrides = (activity === 'overview') ? overviewLabels : cloneActLabels;

    // ── Build columnDefinitions from return_fields ─────────────────
    var columnDefinitions = {
        columns: []
    };
    return_fields.split(",").forEach((_field) => {
        const colDef = { ...colTypeLabelMap[_field]
        };
        if (labelOverrides[_field]) {
            colDef.label = labelOverrides[_field];
        }
        columnDefinitions.columns.push(colDef);
    });

    const rowDefinitions = {
        selectionEnabled: false,
        rows: []
    };
    let gridRowDefinitions = {
        selectionEnabled: false,
        gridRows: []
    };

    const data = api.data.gliderecord_collection_query_1.output.data
        .GlideRecord_Query.sn_instance_clone_request._results;

    let filteredData = data;
    
    if (filteredData.length == 0) {
        api.setState("hasResults", false);
    } else {
        api.setState("hasResults", true);
    }

    filteredData.forEach(record => {
        let row = {
            key: record._row_data.uniqueValue,
            cells: {}
        };
        let gridRow = {
            key: record._row_data.uniqueValue,
            cells: {}
        };

        columnDefinitions.columns.forEach(column => {
            row.cells[column.key] = {
                value: record[column.key] ? record[column.key].displayValue : " - ",
                label: record[column.key] ? record[column.key].displayValue : " - "
            };
            if (column.type === 'custom' && column.componentTag === 'now-highlighted-value') {
                switch (record[column.key].value) {
                    case uiConstants.STATES.REQUESTED:
                        row.cells[column.key]["componentProps"] = {
                            color: uiConstants.COLOR.LOW,
                            label: record[column.key].displayValue,
                            variant: "tertiary",
                            icon: uiConstants.ICON.CLOCK_OUTLINE
                        };
                        break;
                    case uiConstants.STATES.RUNNING:
                        row.cells[column.key]["componentProps"] = {
                            color: uiConstants.COLOR.HIGH,
                            label: record[column.key].displayValue,
                            variant: "tertiary",
                            icon: uiConstants.ICON.CIRCLE_SEMI_CHECK_OUTLINE
                        };
                        break;
                    case uiConstants.STATES.COMPLETED:
                        row.cells[column.key]["componentProps"] = {
                            color: uiConstants.COLOR.POSITIVE,
                            label: record[column.key].displayValue,
                            variant: "tertiary",
                            icon: uiConstants.ICON.CIRCLE_CHECK_OUTLINE
                        };
                        break;
                    case uiConstants.STATES.ERROR:
                        row.cells[column.key]["componentProps"] = {
                            color: uiConstants.COLOR.CRITICAL,
                            label: record[column.key].displayValue,
                            variant: "tertiary",
                            icon: uiConstants.ICON.CIRCLE_INFO_OUTLINE
                        };
                        break;
                    case uiConstants.STATES.CANCELED:
                        row.cells[column.key]["componentProps"] = {
                            color: uiConstants.COLOR.LOW,
                            label: record[column.key].displayValue,
                            variant: "tertiary",
                            icon: uiConstants.ICON.CLOSE_OUTLINE
                        };
                        break;
                    case uiConstants.STATES.DRAFT:
                        row.cells[column.key]["componentProps"] = {
                            color: uiConstants.COLOR.LOW,
                            label: record[column.key].displayValue,
                            variant: "tertiary",
                            icon: uiConstants.ICON.PENCIL_OUTLINE
                        };
                        break;
                    case uiConstants.STATES.ROLLBACK_REQUESTED:
                        row.cells[column.key]["componentProps"] = {
                            color: uiConstants.COLOR.LOW,
                            label: record[column.key].displayValue,
                            variant: "tertiary",
                            icon: uiConstants.ICON.UNDO_TOP_OUTLINE
                        };
                        break;
                    case uiConstants.STATES.ROLLING_BACK:
                        row.cells[column.key]["componentProps"] = {
                            color: uiConstants.COLOR.HIGH,
                            label: record[column.key].displayValue,
                            variant: "tertiary",
                            icon: uiConstants.ICON.UNDO_TOP_OUTLINE
                        };
                        break;
                    case uiConstants.STATES.ROLLBACK_FAILURE:
                        row.cells[column.key]["componentProps"] = {
                            color: uiConstants.COLOR.CRITICAL,
                            label: record[column.key].displayValue,
                            variant: "tertiary",
                            icon: "Circle Info Outline"
                        };
                        break;
                    case uiConstants.STATES.ROLLED_BACK:
                        row.cells[column.key]["componentProps"] = {
                            color: uiConstants.COLOR.POSITIVE,
                            label: record[column.key].displayValue,
                            variant: "tertiary",
                            icon: uiConstants.ICON.UNDO_TOP_OUTLINE
                        };
                        break;
                    default:
                        row.cells[column.key]["componentProps"] = {
                            color: uiConstants.COLOR.INFO,
                            label: record[column.key].displayValue,
                            variant: "tertiary",
                            icon: uiConstants.ICON.CIRCLE_INFO_OUTLINE
                        };
                }
            }
            row.cells['estimated_end_time'] = {
                value: record['estimated_end_time'] ? record['estimated_end_time'].displayValue : " - ",
            };
            row.cells['source_instance'] = {
                value: record['source_instance'] ? record['source_instance'].displayValue || "Current Instance" : " - ",
                label: record['source_instance'] ? record['source_instance'].displayValue : " - ",
            };
            gridRow = JSON.parse(JSON.stringify(row));
            if (column.key == "estimated_clone_duration") {
                gridRow.cells[column.key] = {
                    value: record[column.key] ? record[column.key].value : "0"
                };
            }
            if (column.key == "change_number") {
                row.cells[column.key] = {
                    value: record[column.key].displayValue.length > 5 ? record[column.key].displayValue : "N/A",
                    label: record[column.key].displayValue.length > 5 ? record[column.key].displayValue : "N/A"
                };
            }
        });
        rowDefinitions.rows.push(row);
        gridRowDefinitions.gridRows.push(gridRow);
    });

    api.setState("columnDefinitions", columnDefinitions);
    api.setState("rowDefinitions", rowDefinitions);
    api.setState("gridRowDefinitions", gridRowDefinitions);
}
