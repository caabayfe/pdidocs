function include({ imports }) {
    return {
        sortTableByColumn: function (clickedColumnKey, columnDefinitions, rowData) {
            if (!clickedColumnKey || !columnDefinitions?.columns || !rowData?.rows) {
                return {
                    columnDefinitions,
                    rowData
                };
            }

            const ASC_ICON = {
                value: 'sort-ascending-fill',
                label: 'Sorted ascending'
            };
            const DESC_ICON = {
                value: 'sort-descending-fill',
                label: 'Sorted descending'
            };

            const currentColumns = columnDefinitions.columns;
            const currentRows = rowData.rows;

            const clickedColumnDef = currentColumns.find(col => col.key === clickedColumnKey);
            if (!clickedColumnDef || !clickedColumnDef.sortable) {
                return {
                    columnDefinitions,
                    rowData
                };
            }

            let newSortDirection = 'ascending';

            const updatedColumns = currentColumns.map(col => {
                const updatedCol = { ...col };

                if (col.key === clickedColumnKey) {
                    const currentIcon = col.icons?.endIcons?.[0]?.value;
                    if (!currentIcon || currentIcon === 'sort-descending-fill') {
                        updatedCol.icons = { endIcons: [ASC_ICON] };
                        newSortDirection = 'ascending';
                    } else {
                        updatedCol.icons = { endIcons: [DESC_ICON] };
                        newSortDirection = 'descending';
                    }
                } else {
                    if (col.icons?.endIcons) {
                        delete updatedCol.icons;
                    }
                }

                return updatedCol;
            });

            const sortedRows = [...currentRows].sort((a, b) => {
                const aVal = a?.cells?.[clickedColumnKey]?.label ?? '';
                const bVal = b?.cells?.[clickedColumnKey]?.label ?? '';

                const aNum = parseFloat(aVal);
                const bNum = parseFloat(bVal);
                const bothAreNumbers = !isNaN(aNum) && !isNaN(bNum);

                if (bothAreNumbers) {
                    return newSortDirection === 'ascending' ? aNum - bNum : bNum - aNum;
                }

                return newSortDirection === 'ascending'
                    ? String(aVal).localeCompare(String(bVal))
                    : String(bVal).localeCompare(String(aVal));
            });

            return {
                columnDefinitions: {
                    ...columnDefinitions,
                    columns: updatedColumns
                },
                rowData: {
                    ...rowData,
                    rows: sortedRows
                }
            };
        },

        resetSortIcons: function (columnDefinitions) {
            if (!columnDefinitions?.columns) {
                return columnDefinitions;
            }

            const updatedColumns = columnDefinitions.columns.map(col => {
                const updatedCol = { ...col };

                if (updatedCol.hasOwnProperty('icons')) {
                    delete updatedCol.icons; // completely removes icons
                }

                return updatedCol;
            });

            return {
                ...columnDefinitions,
                columns: updatedColumns
            };
        }
    };
}
