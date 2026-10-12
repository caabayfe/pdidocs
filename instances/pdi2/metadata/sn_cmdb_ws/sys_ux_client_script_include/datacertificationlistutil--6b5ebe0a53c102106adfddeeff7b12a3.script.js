function dataCertificationListUtil(proxyArg, params) {
    const { api, event, helpers, imports } = params;

    let EMPTY_VALUE_LABEL = '';
    let COMMENT_FIELD_KEY = "record_comment";

    const getSelectionCount = (selectionProps, totalRecordCount) => {
        const {
            allRowsSelected,
            exceptedRowIds,
            selectedRowIds
          } = selectionProps;
        
          return allRowsSelected ? totalRecordCount - exceptedRowIds.length : selectedRowIds.length;
    }

    const transformColumnsForDisplay = async (columnDefs, certificationFields) => {
        const CERTIFICATION_FIELD_LABEL = await helpers.translate('Certification field');
        let COMMENT_FIELD_LABEL = await helpers.translate('Comment');
        let updatedColumnDefs = JSON.parse(JSON.stringify(columnDefs));
        updatedColumnDefs.columns.forEach((column) => {
             if (certificationFields.includes(column.key)) {
                 column.icons.endIcons = [{label: CERTIFICATION_FIELD_LABEL, value: 'circle-check-outline'}, ...column.icons.endIcons];
                 if (column.type === "link" || column.type === "person") {
                    column.type = "url";
                    column.opensInNew = true;
                 } else if (column.type === "dateTime") {
                   column.type = "string";
                 }
             }
         });
        _addCommentColumn(updatedColumnDefs, COMMENT_FIELD_LABEL);
        return updatedColumnDefs;
    }
    
    const _addCommentColumn = (updatedColumnDefs, fieldLabel) => {
        let commentColumn = {
            key: COMMENT_FIELD_KEY,
            label: fieldLabel,
            type: "string",
            icons: {endIcons: []},
            metadata: {
                "isFilterable": false,
                "isGroupable": false,
                "isSortable": false,
                "internalType": "string"
            },
            headerTextDisabled: true
        };
        updatedColumnDefs.columns.push(commentColumn);
    }

    const transformRowsForDisplay = async (rowDefs, columnDefs, certificationFields, attributeStatusAndComment, selectionProps, selectionCount, totalRecordCount) => {
        const {
            allRowsSelected
        } = selectionProps;
        if (!EMPTY_VALUE_LABEL) {
            EMPTY_VALUE_LABEL = await helpers.translate('(empty)');
        }
        let updatedRowDefs = JSON.parse(JSON.stringify(rowDefs));
        updatedRowDefs.hasColumnsWithoutAccess = false;
        updatedRowDefs.topActionableMessage = {};
        let columnsWithoutAccess = {};
        const _findColumnsWithoutAccess = (row) => {
            if (row.cellsWithoutAccess) {
                Object.keys(row.cellsWithoutAccess).forEach((colKey) => {
                    columnsWithoutAccess[row.cellsWithoutAccess[colKey].label] = true;
                });
            }
        };

        const _allDisplayedRowsSelected = (rowDefs) => {
            return rowDefs.rows.every((row) => {
                if (row.type == 'grouped') {
                    return row.children.every((_childRow) => {
                        return _childRow.isSelected;
                    });
                } else {
                    return row.isSelected;
                }
            });
        };

        updatedRowDefs.rows.forEach((row, index, rows) => {
            if (row.type == 'grouped') {
                row.children = row.children.map((_childRow) => {
                    const updatedRow = _transformRow(_childRow, columnDefs, certificationFields, attributeStatusAndComment, selectionProps);
                    _findColumnsWithoutAccess(updatedRow);
                    return updatedRow;
                });
            } else {
                const updatedRow = _transformRow(row, columnDefs, certificationFields, attributeStatusAndComment, selectionProps);
                _findColumnsWithoutAccess(updatedRow);
                rows[index] = updatedRow;
            }
        });
        if (Object.keys(columnsWithoutAccess).length > 0) {
            const MISSING_ACL_LABEL = await helpers.translate('Security constraints prevent access to data in the following columns on certain rows: {0}.', Object.keys(columnsWithoutAccess).join(', '));
            updatedRowDefs.topActionableMessage = {
                status: "info",
                text: MISSING_ACL_LABEL,
            };
            updatedRowDefs.hasColumnsWithoutAccess = true;
        }
        if (!allRowsSelected && selectionCount && _allDisplayedRowsSelected(updatedRowDefs)) {
            let message = await helpers.translate('{0} item(s) in this list are selected', selectionCount)
            updatedRowDefs.topActionableMessage = {
                status: updatedRowDefs.topActionableMessage.status || "low",
                text: updatedRowDefs.topActionableMessage.text ? updatedRowDefs.topActionableMessage.text + ' ' + message : message,
                action: {
                    label: await helpers.translate('Select all {0} list items', totalRecordCount),
                    action: "TOGGLE_SELECT_ALL_ROWS"
                }
            };
        } else if (allRowsSelected) {
            let message = await helpers.translate('{0} item(s) in this list are selected. Before you continue, review the rest of the items in subsequent pages as your selected action will apply to all those items.', selectionCount);
            updatedRowDefs.topActionableMessage = {
                status: updatedRowDefs.topActionableMessage.status || "low",
                text: updatedRowDefs.topActionableMessage.text ? updatedRowDefs.topActionableMessage.text + ' ' + message : message,
                action: {
                    label: await helpers.translate('Clear selection'),
                    action: "TOGGLE_SELECT_ALL_ROWS"
                }
            };
        } else if (!updatedRowDefs.topActionableMessage.text) {
            updatedRowDefs.topActionableMessage = {};
        }

        return updatedRowDefs;
    }
    
    const _transformRow = (row, columnDefs, certificationFields, attributeStatusAndComment, selectionProps) => {
        const {
            allRowsSelected,
            exceptedRowIds,
            selectedRowIds
        } = selectionProps;
        let updatedRow = JSON.parse(JSON.stringify(row));
        let statusKeys = Object.keys(attributeStatusAndComment);
        let rowKey = attributeStatusAndComment[updatedRow.key];
        if (!rowKey) {
            for (var i = 0; i < statusKeys.length; i++) {
                if (updatedRow.key.indexOf(statusKeys[i]) > -1) {
                    rowKey = attributeStatusAndComment[statusKeys[i]];
                    break;
                }
            }
        }

        const _arrayIncludesRowKey = (array, rowKey) => {
            for (var i = 0; i < array.length; i++) {
                if (rowKey.indexOf(array[i]) > -1) {
                    return true;
                }
            }
            return false;
        };

        if(_arrayIncludesRowKey(selectedRowIds, updatedRow.key) || (allRowsSelected && !_arrayIncludesRowKey(exceptedRowIds, updatedRow.key))) {
            updatedRow.isSelected = true;
        } else {
            updatedRow.isSelected = false;
        }

        columnDefs.columns.forEach((column) => {
            if (certificationFields.includes(column.key)) {
                let attrKey = rowKey['attributes'][column.key];
                let certificationState = attrKey.status;
                let cell = updatedRow.cells[column.key];
                if (!cell) { // cell is missing, user does not have access to this column on this row
                    if (!updatedRow.cellsWithoutAccess) {
                        updatedRow.cellsWithoutAccess = {};
                    }
                    updatedRow.cellsWithoutAccess[column.key] = column;
                    updatedRow.selectionDisabled = true;
                    return;
                }

                let label = cell.label || cell.value;
                if (cell && cell.type && (cell.type == 'number' || cell.type == 'boolean'))
                    label = cell.metadata.internalValue;
                if (cell && cell.metadata && cell.metadata.internalType && cell.metadata.internalType === 'reference') {
                    if(label) {
                         cell.metadata.internalType = "url";
                         cell.value = helpers.getCurrentExperienceUrl() + "/record/" + cell.metadata.openRecordMetadata.table + "/" + cell.metadata.openRecordMetadata.sysId;
                    } else {
                          cell.disabled = true; //to prevent empty link when there's no cell value
                    }
                    
                }
                if (cell && cell.metadata && cell.metadata.internalType && (cell.metadata.internalType === 'glide_date' || cell.metadata.internalType === 'glide_date_time')) {
                    cell.metadata.internalType = 'string';
                    cell.value = cell.metadata.internalValue;
                }
                
                label = label || EMPTY_VALUE_LABEL;
              
               switch (certificationState) {
                    case "failed":
                        cell["highlightedValue"] = {
                            color: "critical",
                            value: label,
                            variant: "tertiary",
                            showIcon: true,
                            iconName: "close-fill"
                        };
                        if (label === EMPTY_VALUE_LABEL) {
                            cell.label = label;
                            cell.value =  label;
                        }
                        break;
                    case "certified":
                        cell["highlightedValue"] = {
                            color: "positive",
                            value: label,
                            variant: "tertiary",
                            showIcon: true,
                            iconName: "check-fill"
                        };
                        if (label === EMPTY_VALUE_LABEL) {
                            cell.label = label;
                            cell.value =  label;
                        }
                        break;
                    case "cancelled":
                        cell["highlightedValue"] = {
                            color: "gray",
                            value: label,
                            variant: "tertiary",
                            showIcon: true,
                            iconName: "ban-fill"
                        };
                        if (label === EMPTY_VALUE_LABEL) {
                            cell.label = label;
                            cell.value =  label;
                        }
                        break;
                    default:
                        cell["highlightedValue"] = null;
                }

                // Show attribute comment on hover (Note: Presentational list bug - custom tooltip doesn't work)
                // let certificationComment = attrKey.comment;
                // if (certificationComment)
                //     cell['data-tooltip'] = certificationComment;
            }
        });

        // Add cell for showing comments
        let attributeComment = rowKey.recordLevelComment;
        updatedRow.cells[COMMENT_FIELD_KEY] = {
            "value": attributeComment,
            "label": attributeComment,
            "metadata": {
                "referenceSysId": null,
                "internalValue": attributeComment,
                "internalType": "string"
            },
            "highlightedValue": null
        };

        return updatedRow;
    }

    return {
        transformColumnsForDisplay,
        transformRowsForDisplay,
        getSelectionCount
    }
}
