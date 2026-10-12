var CertificationRecordsListUtil = Class.create();
CertificationRecordsListUtil.prototype = {
    initialize: function() {
    },

	EMPTY_VALUE_LABEL: '',

    transformColumnsForDisplay:  function(columnDefs, certificationFields) {
        const CERTIFICATION_FIELD_LABEL = gs.getMessage('Certification field');
        columnDefs.columns.forEach((column) => {
		if (certificationFields.includes(column.key)) {
			column.icons.endIcons = [{label: CERTIFICATION_FIELD_LABEL, value: 'circle-check-outline'}];
			if (column.type === "link" || column.type === "person") {
				column.type = "url";
				column.opensInNew = true;
			} else if (column.type === "dateTime") {
				column.type = "string";
			}
            	}
        });
    },

    transformRowsForDisplay: function(rowDefs, columnDefs, certificationFields, attributeStatus, experienceUrl) {
        if (!this.EMPTY_VALUE_LABEL) {
            this.EMPTY_VALUE_LABEL = gs.getMessage('(empty)');
        }
        rowDefs.hasColumnsWithoutAccess = false;
        let columnsWithoutAccess = {};
        const _findColumnsWithoutAccess = (row) => {
            if (row.cellsWithoutAccess) {
                Object.keys(row.cellsWithoutAccess).forEach((colKey) => {
                    columnsWithoutAccess[row.cellsWithoutAccess[colKey].label] = true;
                });
            }
        };

        rowDefs.rows.forEach((row, index, rows) => {
            if (row.type == 'grouped') {
                row.children = row.children.map((_childRow) => {
                    const updatedRow = this._transformRow(_childRow, columnDefs, certificationFields, attributeStatus, experienceUrl);
                    _findColumnsWithoutAccess(updatedRow);
                    return updatedRow;
                });
            } else {
                const updatedRow = this._transformRow(row, columnDefs, certificationFields, attributeStatus, experienceUrl);
                _findColumnsWithoutAccess(updatedRow);
                rows[index] = updatedRow;
            }
        });
        if (Object.keys(columnsWithoutAccess).length > 0) {
            const MISSING_ACL_LABEL = gs.getMessage('Security constraints prevent access to data in the following columns on certain rows: {0}.', Object.keys(columnsWithoutAccess).join(', '));
            rowDefs.topActionableMessage = {
                status: "info",
                text: MISSING_ACL_LABEL,
            };
            rowDefs.hasColumnsWithoutAccess = true;
        }
    },

    _transformRow : function(row, columnDefs, certificationFields, attributeStatus, experienceUrl) {
        let updatedRow = JSON.parse(JSON.stringify(row));

        columnDefs.columns.forEach((column) => {
            if (certificationFields.includes(column.key)) {
                let certificationState = attributeStatus[updatedRow.key]["status"][column.key].status;
                let cell = updatedRow.cells[column.key];
                if (!cell) { // cell is missing, user does not have access to this column on this row
                    if (!updatedRow.cellsWithoutAccess) {
                        updatedRow.cellsWithoutAccess = {};
                    }
                    updatedRow.cellsWithoutAccess[column.key] = column;
                    updatedRow.selectionDisabled = true;
                    return;
                }
                let label = cell.value;
                if (cell && cell.type && (cell.type == 'number' || cell.type == 'boolean'))
                    label = cell.metadata.internalValue;
                if (cell && cell.metadata && cell.metadata.internalType && cell.metadata.internalType === 'reference') {
                    if(label) {
                        cell.metadata.internalType = "url";
                        cell.value = experienceUrl + "/record/" + cell.metadata.openRecordMetadata.table + "/" + cell.metadata.openRecordMetadata.sysId;
                    } else {
                        cell.disabled = true; //to prevent empty link when there's no cell value
                    }
                }
		if (cell && cell.metadata && cell.metadata.internalType && (cell.metadata.internalType === 'glide_date' || cell.metadata.internalType === 'glide_date_time')) {
			cell.metadata.internalType = 'string';
			cell.value = cell.metadata.internalValue;
		}
				
                label = label || this.EMPTY_VALUE_LABEL;

                switch (certificationState) {
                    case "failed":
                        cell["highlightedValue"] = {
                            color: "critical",
                            value: label,
                            variant: "tertiary",
                            showIcon: true,
                            iconName: "close-fill"
                        };
                        if (label === this.EMPTY_VALUE_LABEL) {
                            cell.label = label;
                            cell.value =  label;
                        }
                        break;
                    case "certified":
                        cell["highlightedValue"] = {
                            value: label,
                            color: "positive",
                            variant: "tertiary",
                            showIcon: true,
                            iconName: "check-fill"
                        };
                        if (label === this.EMPTY_VALUE_LABEL) {
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
                        if (label === this.EMPTY_VALUE_LABEL) {
                            cell.label = label;
                            cell.value =  label;
                        }
                        break;
                    default:
                        cell["highlightedValue"] = null;
                        break;
                }
            }
        });

        return updatedRow;
    },

    type: 'CertificationRecordsListUtil'
};
