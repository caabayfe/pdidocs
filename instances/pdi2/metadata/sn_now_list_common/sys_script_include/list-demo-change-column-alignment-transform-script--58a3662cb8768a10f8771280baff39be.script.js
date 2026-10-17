(function transform(transformBuilder, transformScriptArgs) {
    try {
        if (!transformBuilder) return;
        var listModel = transformBuilder;

        // change the priority to a number type, also need to update the value in the cells
        listModel.columnDefinitions.columns.forEach(function(column) {
            if (column.key === 'priority') {
                column.type = 'number';
            }
        });
        listModel.rowDefinitions.rows.forEach(function(row) {
            row.cells.priority.value = parseInt(row.cells.priority.value);
        });

        // add the type to the column label
        listModel.columnDefinitions.columns.forEach(function(column) {
            column.label = column.label + ' - ' + column.type;
        });

        // change the column alignment for specific columns or based on the column type
        const alignments = {
            number: {
                cell: 'inverse',
                header: 'center'
            },
            string: {
                cell: 'center',
                header: 'inverse'
            },
            person: {
                cell: 'center',
                header: 'inverse'
            },
            link: {
                cell: 'inverse',
                header: 'center'
            },
            sys_class_name: {
                cell: 'default',
                header: 'inverse'
            },
            state: {
                cell: 'inverse',
                header: 'default'
            }
        };
        listModel.columnDefinitions.columns.forEach(function(column) {
            const alignment = alignments[column.key] || alignments[column.type];
            column.alignment = alignment.cell;
            column.headerCellAlignment = alignment.header;
        });

        return listModel.transform();
    }

    // do not remove
    catch (error) {
        return {
            failed: true,
            error: error.message
        };
    }
})(transformBuilder, transformScriptArgs);
